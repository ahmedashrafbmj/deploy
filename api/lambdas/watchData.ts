"use strict";

import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import moment from "moment";
import { tz } from "moment-timezone";
import fetch from "node-fetch";

import { getAllUsers } from "../lib/util";

// AWS SDK S3 client
const s3 = new S3Client({ region: "us-east-2" });

// base bucket parameters
const baseBucketParams = {
  Bucket: process.env.S3_HRV_BUCKET,
  MaxKeys: 1,
};

/**
 * Lambda: check if watch data has been uploaded for a participant from previous
 * calendar day. Purely indicates whether or not data exists in S3 for a day.
 */
module.exports.check = async (_evt, ctx, _cb) => {
  // get all users
  const users = await getAllUsers();

  // get yesterday's date once to keep static for entire checking process
  const date = tz(moment().subtract(1, "days"), "America/Chicago").format(
    "YYYYMMDD"
  );

  for (const user of users) {
    // custom, per-user bucket parameters
    var bucketParams = {
      ...baseBucketParams,
      Prefix: `public/${user.username}/${date}`,
    };

    // attempt to get data from S3
    const command = new ListObjectsV2Command(bucketParams);
    const data = await s3.send(command);

    if (!(user.daysInStudy <= 0) && !(user.daysInStudy > 30)) {
      if (!data.Contents) {
        // no watch data for today, create alert
        await fetch(`${process.env.API_BASE_URL}/alert/watch/${user.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": `${process.env.API_KEY}`,
          },
        });
      }
    }
  }

  console.log(
    `Completed ${ctx.functionName} at ${new Date().toLocaleString()}`
  );
};
