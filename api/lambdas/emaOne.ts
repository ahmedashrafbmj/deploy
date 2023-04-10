"use strict";

import fetch from "node-fetch";
import moment from "moment";
import { tz } from "moment-timezone";

import { pushNotificationRequest, getAllUsers } from "../lib/util";

/**
 * Lambda: EMA set one notification
 */
module.exports.push = async (_evt, ctx, _cb) => {
  // get all users
  const users = await getAllUsers();

  for (const user of users) {
    // time to send message from database (Unix epoch seconds)
    const scheduledEpochSeconds: number = user.messageTimeToday;

    if (scheduledEpochSeconds !== undefined && scheduledEpochSeconds !== null) {
      // current time based on CST (Unix epoch seconds)
      const currentEpochSeconds = tz(moment(), "America/Chicago").unix();

      console.log(`Message time: ${scheduledEpochSeconds}`);
      console.log(`Current time: ${currentEpochSeconds}`);

      const messageType: string = "ema_set_one";
      if (
        // EMA set 1 not yet sent today
        user.emaOneSentToday === false &&
        // make sure current time is past scheduled time for absolute value calculation
        currentEpochSeconds > scheduledEpochSeconds &&
        // GTE 0 minutes, LT 5 minutes
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) >= 0 &&
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) < 300
      ) {
        const messageBody: string = "Tap here to complete your first survey!";

        console.log(
          `Sending EMA set 1 to user ${user.username} at ${currentEpochSeconds} minutes with scheduled time at ${scheduledEpochSeconds} minutes`
        );

        // issue push notification to user
        console.log(`Sending EMA set 1 initial push to ${user.username}`);
        pushNotificationRequest(user.pushToken, messageBody, {
          type: messageType,
          prompt: "initial_notification",
        });

        // update sent user messages (add message record for EMA one)
        await fetch(`${process.env.API_BASE_URL}/push/${user.id}/ema-one`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.API_KEY}`,
          },
          body: JSON.stringify({
            messageType,
            messageBody,
            inWindow: user.inWindowToday,
          }),
        });
      } else if (
        // EMA set 1 sent today
        user.emaOneSentToday === true &&
        // EMA set 1 reminder not sent today
        user.emaOneReminderSentToday === false &&
        // EMA set 1 not opened today
        user.emaOneOpenedToday === false &&
        // intervention message not sent today
        user.messageSentToday === false &&
        // GTE 5 minutes, LT 10 minutes
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) >= 300 &&
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) < 600
      ) {
        // issue set 1 reminder push notification to user
        console.log(`Sending EMA set 1 reminder push to ${user.username}`);
        pushNotificationRequest(
          user.pushToken,
          "Don't forget to complete your first survey! Tap here to complete it.",
          { type: messageType, prompt: "reminder_notification" }
        );

        // mark EMA one reminder sent in database
        await fetch(`${process.env.API_BASE_URL}/ema/${user.id}/reminder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.API_KEY}`,
          },
          body: JSON.stringify({
            set: "one",
          }),
        });
      }
    }
  }

  console.log(
    `Completed ${ctx.functionName} at ${new Date().toLocaleString()}`
  );
};
