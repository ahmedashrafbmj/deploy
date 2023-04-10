"use strict";

import moment from "moment";
import { tz } from "moment-timezone";
import fetch from "node-fetch";

import { getAllUsers } from "../lib/util";

/**
 * Lambda: reset randomization if necessary
 */
module.exports.reset = async (_evt, ctx, _cb) => {
  // get all users
  const users = await getAllUsers();

  // update all users
  for (const user of users) {
    // check if user is done with study (30-day window completed)
    if (user.daysInStudy === 30) {
      // current unix time
      const currentEpochSeconds = tz(moment(), "America/Chicago").unix();

      // user global window end today
      const globalEpochEnd: number = user.window[30][0][1];

      if (
        // global window end is a valid time
        globalEpochEnd &&
        // current time later than global window time
        currentEpochSeconds > globalEpochEnd &&
        // user randomized today
        user.randomizedToday === true &&
        // redundant EMA two sent check, but a final verification for assurance
        user.emaTwoSentToday
      ) {
        await fetch(
          `${process.env.API_BASE_URL}/auth/${user.id}/randomization`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.API_KEY}`,
            },
            body: JSON.stringify({
              message: "N/A",
              messageType: "N/A",
              messageTime: 0,
              windowChance: false,
              // current days in study is incremented at endpoint
              daysInStudy: user.daysInStudy,
            }),
          }
        );
      }
    }

    // attempt randomization only if window is not empty and contains index with
    // current days in study
    else if (
      Object.keys(user.window).length !== 0 &&
      !!user.window[user.daysInStudy]
    ) {
      // current unix time
      const currentEpochSeconds = tz(moment(), "America/Chicago").unix();

      // user global window end today
      const globalEpochEnd: number = user.window[user.daysInStudy][0][1];

      console.log(
        `Current Epoch Seconds: ${currentEpochSeconds}, globalEpochEnd: ${globalEpochEnd}`
      );

      if (
        // global window end is a valid time
        globalEpochEnd &&
        // current time later than global window time
        currentEpochSeconds > globalEpochEnd &&
        // user randomized today
        user.randomizedToday === true &&
        // redundant EMA two sent check, but a final verification for assurance
        user.emaTwoSentToday
      ) {
        // reset randomization to false (i.e. mark need for randomization)
        await fetch(
          `${process.env.API_BASE_URL}/auth/${user.id}/reset-randomization`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.API_KEY}`,
            },
          }
        );
      }
    }
  }

  console.log(
    `Completed ${ctx.functionName} at ${new Date().toLocaleString()}`
  );
};
