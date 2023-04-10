"use strict";

import fetch from "node-fetch";
import moment from "moment";
import { tz } from "moment-timezone";

import { pushNotificationRequest, getAllUsers } from "../lib/util";

/**
 * Lambda: EMA set two notification
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

      const messageType: string = "ema_set_two";
      if (
        // EMA set 1 sent today
        user.emaOneSentToday === true &&
        // EMA set 2 reminder not sent today
        user.emaTwoSentToday === false &&
        // GTE 70 minutes, LT 75 minutes
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) >= 4200 &&
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) < 4500
      ) {
        const messageBody: string = "Tap here to complete your second survey!";

        // issue push notification to user
        console.log(`Sending EMA set 2 initial push to ${user.username}`);
        pushNotificationRequest(user.pushToken, messageBody, {
          type: messageType,
          prompt: "initial_notification",
        });

        // update sent user messages (add message record for EMA two)
        await fetch(`${process.env.API_BASE_URL}/push/${user.id}/ema-two`, {
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
        // EMA set 2 sent today
        user.emaTwoSentToday === true &&
        // EMA set 2 reminder not sent today
        user.emaTwoReminderSentToday === false &&
        // EMA set 2 not opened today
        user.emaTwoOpenedToday === false &&
        // GTE 100 minutes, LT 105 minutes
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) >= 6000 &&
        Math.abs(currentEpochSeconds - scheduledEpochSeconds) < 6300
      ) {
        // issue set 2 reminder push notification to user
        console.log(`Sending EMA set 2 reminder push to ${user.username}`);
        pushNotificationRequest(
          user.pushToken,
          "Don't forget to complete your second survey! Tap here to complete it.",
          { type: messageType, prompt: "reminder_notification" }
        );

        // mark EMA two reminder sent in database
        await fetch(`${process.env.API_BASE_URL}/ema/${user.id}/reminder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.API_KEY}`,
          },
          body: JSON.stringify({
            set: "two",
          }),
        });
      }
    }
  }

  console.log(
    `Completed ${ctx.functionName} at ${new Date().toLocaleString()}`
  );
};
