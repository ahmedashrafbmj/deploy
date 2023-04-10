import moment from "moment";
import { tz } from "moment-timezone";
import fetch from "node-fetch";

/**
 * Issue a push notification to a user.
 * @param {string} pushToken user push token for device identification
 * @param {string} body message body
 * @param {Object} data extra data
 */
const pushNotificationRequest = async (
  pushToken: string,
  body: string,
  data?: { [key: string]: any }
) => {
  await fetch(`${process.env.ONESIGNAL_BASE_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // application ID
      app_id: process.env.ONESIGNAL_APP_ID,
      // user ID (push token)
      include_player_ids: [pushToken],
      // android notification channel ID
      android_channel_id: process.env.ANDROID_CHANNEL_ID,
      // android priority
      priority: 10,
      // message title
      headings: {
        en: "apt.mind",
      },
      // message body
      contents: {
        en: body,
      },
      // extra data
      data: {
        ...data,
        // notification send time
        sendTime: tz(moment(), "America/Chicago").unix(),
      },
    }),
  });
};

export default pushNotificationRequest;
