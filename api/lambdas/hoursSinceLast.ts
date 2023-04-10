"use strict";

import { differenceInHours } from "date-fns";
import fetch from "node-fetch";

import { getAllUsers } from "../lib/util";

// ========================================================================== //
// update hours since last progress statistic                                 //
// ========================================================================== //
module.exports.update = async (_evt, ctx, _cb) => {
  // get all users
  const users = await getAllUsers();

  for (const user of users) {
    console.log(`Fetching hours for ${user.id}`);

    // get current hours of user
    const res = await fetch(
      `${process.env.API_BASE_URL}/progress/${user.id}/hours`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-api-key": `${process.env.API_KEY}`,
        },
      }
    );
    const data = await res.json();

    if (data !== undefined && data !== null) {
      const time = data[0].createdAt;

      // calculate time difference in hours (integer)
      const difference = differenceInHours(
        new Date(Date.now()),
        new Date(time)
      );

      console.log(`Time: ${time}`);
      console.log(`Difference: ${difference}`);

      // update hours since last activity for user
      await fetch(
        `${process.env.API_BASE_URL}/progress/${user.id}/hours?hours=${difference}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.API_KEY}`,
          },
          // use original createdAt time so that value can be overwritten consistently
          // add server boolean flag to indicate that this is a pseudo-time
          body: JSON.stringify({ time, server: true }),
        }
      );
    }
  }

  console.log(
    `Completed ${ctx.functionName} at ${new Date().toLocaleString()}`
  );
};
