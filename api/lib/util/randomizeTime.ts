import _ from "lodash";

import { getRandomInt } from ".";

/**
 * Randomly select time to prompt a user the next day.
 *
 * @param userWindows user windows array; first tuple is global constraint range
 * @param {boolean} inWindow whether or not user is randomized into window
 *
 * @returns {number} time to message user next day
 */
const randomizeTime = (userWindows: any, inWindow: boolean): number => {
  // extract global and local windows
  const globalWindow = userWindows[0];
  const localWindows = userWindows[1];

  // randomized time (desired output)
  let randomizedTime: number;

  if (inWindow) {
    // inside a local window: pick random window from tomorrow's local windows
    const windowIdx: number = Math.floor(Math.random() * localWindows.length);
    const randomWindow = localWindows[windowIdx];

    // calculate random time within randomly-selected local window
    // this number will be within global window by definition of local windows
    randomizedTime = getRandomInt(randomWindow[0], randomWindow[1]);
  } else {
    // outside local windows
    // whether hour is outside of window (true to continue)
    let hourOutOfWindow: boolean = false;
    // counter for early termination if too many loops
    let i = 0;
    while (!hourOutOfWindow) {
      // start and end buffer for randomization
      // 1 hour on left, 3 hours on right
      const globalStartBuffer = globalWindow[0] + 3600;
      const globalEndBuffer = globalWindow[1] - 10800;

      // calculate random time within global window buffers
      randomizedTime = getRandomInt(globalStartBuffer, globalEndBuffer);

      // map over all windows to verify range
      const mappedWindows = localWindows.map((localWindow) => {
        if (
          // hour in local window
          _.inRange(randomizedTime, localWindow[0], localWindow[1]) ||
          // hour outside of global window
          !_.inRange(randomizedTime, globalStartBuffer, globalEndBuffer)
        ) {
          // failure: try again
          return false;
        } else {
          // success: hour within global window, but outside of local window
          return true;
        }
      });

      i++;
      // `true` if hour is outside of all ranges, `false` otherwise
      if (i >= 10 || mappedWindows.every(Boolean)) {
        hourOutOfWindow = true;
      }
    }
  }

  return randomizedTime;
};

export default randomizeTime;
