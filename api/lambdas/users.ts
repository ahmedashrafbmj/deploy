"use strict";

import fetch from "node-fetch";
import _ from "lodash";

import { getAllUsers, randomizeTime } from "../lib/util";
import messagePool from "../lib/data/messages";

/**
 * Check EMA completion today.
 *
 * @param user user to check
 */
const checkDailyEmaCompletion = async (user: any) => {
  // number of days user in study (i.e. number of times randomized)
  const daysInStudy = user.daysInStudy;

  // constrain EMA check to users in 30-day window
  if (!(daysInStudy <= 0) && !(daysInStudy >= 30)) {
    if (!user.emaOneCompletedToday && !user.emaTwoCompletedToday) {
      // record failure if both EMAs incomplete today
      await fetch(`${process.env.API_BASE_URL}/alert/ema/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${process.env.API_KEY}`,
        },
      });
    }
  }
};

/**
 * Randomly select a message from a category. Filters messages based on what
 * user has already received.
 * @param {string} category message category; enum {"random", "app"}
 */
const selectMessage = (curMessages: any, category: string) => {
  // get current messages
  const messages = curMessages.filter(
    (messageObj) => messageObj.type === category
  );
  const messageBodies = messages.map((message) => message.message);

  // filter array (remove already-sent messages)
  const filteredMessages = messagePool[category].filter((message) => {
    return !messageBodies.includes(message);
  });

  // randomly select message from filtered messages
  const selectedMessage =
    filteredMessages[Math.floor(Math.random() * filteredMessages.length)];

  return selectedMessage;
};

/**
 * Lambda: randomize users after their daily window completes
 */
module.exports.randomize = async (_evt, ctx, _cb) => {
  // get all users
  const users = await getAllUsers();

  // update all users
  for (const user of users) {
    // randomize if not randomized today
    if (!user.randomizedToday) {
      // check daily EMA completion
      console.log(`Checking for EMA completion failures for user ${user.id}`);
      // execution count state for idempotency
      let executionCount = 0;
      if (executionCount === 0) {
        executionCount++;
        await checkDailyEmaCompletion(user);
      }

      console.log(`Performing randomization for user ${user.id}`);

      // inside or outside window: 1/2 chance (pseudorandom)
      const windowChance: boolean = Math.random() < 0.5;

      // message type: 1/3 chance (pseudorandom)
      const messageTypeOptions = ["none", "app", "regulatory"];
      let messageType: string =
        messageTypeOptions[
          Math.floor(Math.random() * messageTypeOptions.length)
        ];

      // get next window
      const nextDayInStudy: number = user.daysInStudy + 1;
      const windowTomorrow = user.window[nextDayInStudy];

      // randomize time if window exists
      if (windowTomorrow) {
        const tomorrowScheduledUnixTime = randomizeTime(
          windowTomorrow,
          windowChance
        );

        // get user's current messages
        const curMessagesRes = await fetch(
          `${process.env.API_BASE_URL}/push/${user.id}/messages`,
          {
            headers: {
              "x-api-key": `${process.env.API_KEY}`,
            },
          }
        );
        const curMessages: Array<{
          [key: string]: any;
        }> = await curMessagesRes.json();

        // select message based on selected category
        let selectedMessage: string;
        switch (messageType) {
          case "app":
            // `app` randomization, pick app message
            selectedMessage = selectMessage(curMessages, "app");

            // if category expended, try other category
            if (!selectedMessage) {
              console.log("app --> reg");
              messageType = "regulatory";
              selectedMessage = selectMessage(curMessages, "regulatory");
            }

            // force "none" if all messages sent from both categories
            if (!selectedMessage) {
              console.log("app --> none");
              messageType = "none";
              selectedMessage = "";
            }
            break;
          case "regulatory":
            // `regulatory` randomization, pick regulatory message
            selectedMessage = selectMessage(curMessages, "regulatory");

            // if category expended, try other category
            if (!selectedMessage) {
              console.log("reg --> app");
              messageType = "app";
              selectedMessage = selectMessage(curMessages, "app");
            }

            // force "none" if all messages sent from both categories
            if (!selectedMessage) {
              console.log("reg --> none");
              messageType = "none";
              selectedMessage = "";
            }
            break;
          case "none":
          default:
            // `none` randomization
            messageType = "none";
            selectedMessage = "";
            break;
        }

        // update user data
        await fetch(
          `${process.env.API_BASE_URL}/auth/${user.id}/randomization`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.API_KEY}`,
            },
            body: JSON.stringify({
              message: selectedMessage,
              messageType,
              messageTime: tomorrowScheduledUnixTime,
              windowChance,
              // current days in study is incremented at endpoint
              daysInStudy: user.daysInStudy,
            }),
          }
        );

        console.log(`User ${user.id} updated`);
      }
    }
  }

  console.log(
    `Completed ${ctx.functionName} at ${new Date().toLocaleString()}`
  );
};
