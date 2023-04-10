"use strict";

import fetch from "node-fetch";
import moment from "moment";
import { tz } from "moment-timezone";

import { pushNotificationRequest, getAllUsers } from "../lib/util";

/**
 * Lambda: send message notification
 */
module.exports.push = async (_evt, ctx, _cb) => {
  // get all users
  const users = await getAllUsers();

  for (const user of users) {
    // time to send message from database
    const scheduledEpochSeconds: number = user.messageTimeToday;

    if (scheduledEpochSeconds !== undefined && scheduledEpochSeconds !== null) {
      // current time based on CST (Unix epoch seconds)
      const currentEpochSeconds = tz(moment(), "America/Chicago").unix();

      // check if current time is near message time
      if (
        // not `none` randomization
        user.messageTypeToday !== "none" &&
        // EMA set 1 sent today
        user.emaOneSentToday === true &&
        // intervention message not sent today
        user.messageSentToday === false &&
        // GTE 10 minutes, LT 15 minutes
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) >= 600 &&
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) < 900
      ) {
        // issue push notification to user
        console.log(`Sending intervention message push to ${user.username}`);
        pushNotificationRequest(user.pushToken, user.messageToday, {
          type: user.messageTypeToday,
        });

        // update sent user messages (add intervention message record)
        await fetch(`${process.env.API_BASE_URL}/push/${user.id}/record`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.API_KEY}`,
          },
          body: JSON.stringify({
            messageType: user.messageTypeToday,
            messageBody: user.messageToday,
            inWindow: user.inWindowToday,
          }),
        });
      } else if (
        // `none` randomization
        user.messageTypeToday === "none" &&
        // EMA set 1 sent today
        user.emaOneSentToday === true &&
        // intervention message not yet sent today
        user.messageSentToday === false &&
        // GTE 10 minutes, LT 15 minutes
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) >= 600 &&
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) < 900
      ) {
        // update sent user messages (add intervention message record)
        await fetch(`${process.env.API_BASE_URL}/push/${user.id}/record`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.API_KEY}`,
          },
          body: JSON.stringify({
            messageType: "none",
            messageBody: "N/A",
            inWindow: user.inWindowToday,
          }),
        });
      }
    }
  }

  console.log(
    `Completed ${ctx.functionName} at ${new Date().toLocaleString()}`
  );
};
