import { Temporal } from "proposal-temporal";

import { WeekWindows } from "../types";
import convertDateToUnixTime from "./convertDateToUnixTime";
import temporalDateTimeToString from "./temporalDateTimeToString";
import getDayOfWeek from "./getDayOfWeek";

/**
 * Helper function for that fills a window object with timestamps based on seed
 * day.
 *
 * @see generateWindow
 *
 * @param {WeekWindows} seed weekly window seed
 */
const fillWindow = (seed: WeekWindows) => {
  const dateBeforeStudy = seed.dateBeforeStudy;
  const temporalGlobalStartDate = Temporal.PlainDate.from(dateBeforeStudy);
  const temporalGlobalEndDate = Temporal.PlainDate.from(dateBeforeStudy);

  let filledWindow = {};
  for (let i = 1; i <= 30; i++) {
    // global date start and end
    const incrementedGlobalStartDate = temporalGlobalStartDate.add({ days: i });

    // day of week (e.g. 'monday')
    const dayOfWeek = getDayOfWeek(incrementedGlobalStartDate);

    // calculate end date based on overnight window boolean
    const incrementedGlobalEndDate = seed[dayOfWeek].overnight
      ? temporalGlobalEndDate.add({ days: i + 1 })
      : temporalGlobalEndDate.add({ days: i });

    // global hour start and end
    const incrementedGlobalStartHour: string = seed[dayOfWeek].globalStartHour;
    const incrementedGlobalEndHour: string = seed[dayOfWeek].globalEndHour;

    // combine date and hour for global window
    const incrementedGlobalStart = Temporal.PlainDateTime.from(
      `${incrementedGlobalStartDate.toString()} ${incrementedGlobalStartHour}`
    );
    const incrementedGlobalEnd = Temporal.PlainDateTime.from(
      `${incrementedGlobalEndDate.toString()} ${incrementedGlobalEndHour}`
    );

    // fill local windows
    const localWindows = [];
    for (const localWindow of seed[dayOfWeek].localHours) {
      // local start and end hours (HH)
      const incrementedLocalStartHour = localWindow[0];
      const incrementedLocalEndHour = localWindow[1];

      // whether local window is in same day or spread overnight
      const overnight: boolean = localWindow[2];

      // combine date and hour for local window
      const incrementedLocalStart = Temporal.PlainDateTime.from(
        `${incrementedGlobalStartDate.toString()} ${incrementedLocalStartHour}`
      );
      const incrementedLocalEnd = Temporal.PlainDateTime.from(
        `${
          overnight
            ? // local window spread overnight to two days
              incrementedGlobalStartDate.add({ days: 1 }).toString()
            : // local window in same day
              incrementedGlobalStartDate.toString()
        } ${incrementedLocalEndHour}`
      );

      localWindows.push([
        temporalDateTimeToString(incrementedLocalStart),
        temporalDateTimeToString(incrementedLocalEnd),
      ]);
    }

    filledWindow = {
      ...filledWindow,
      [i]: {
        globalStart: temporalDateTimeToString(incrementedGlobalStart),
        globalEnd: temporalDateTimeToString(incrementedGlobalEnd),
        local: localWindows,
      },
    };
  }

  return filledWindow;
};

/**
 * Generate user window based on seed start date.
 *
 * @param {WeekWindows} seed weekly window seed
 */
const generateWindow = (seed: WeekWindows) => {
  // STEP 1: expand window to 30 days from 1 seed day
  const windows = fillWindow(seed);

  // STEP 2: Convert window timestamps (YYYYMMDD HH) to Unix times
  let generatedWindow = {};
  for (const window in windows) {
    // fill local windows
    const localWindows = [];
    for (const localWindow in windows[window].local) {
      localWindows.push([
        convertDateToUnixTime(windows[window].local[localWindow][0]),
        convertDateToUnixTime(windows[window].local[localWindow][1]),
      ]);
    }

    // append entry
    generatedWindow = {
      ...generatedWindow,
      [window]: [
        [
          // fill global windows
          convertDateToUnixTime(windows[window].globalStart),
          convertDateToUnixTime(windows[window].globalEnd),
        ],
        localWindows,
      ],
    };
  }

  return generatedWindow;
};

export default generateWindow;
