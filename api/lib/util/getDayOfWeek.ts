import { Temporal } from "proposal-temporal";

/**
 * Get readable day of week (e.g. "monday").
 *
 * @param {Temporal.PlainDate} date date to check
 */
const getDayOfWeek = (date: Temporal.PlainDate) => {
  let day: string;
  switch (date.dayOfWeek) {
    case 1:
      day = "monday";
      break;
    case 2:
      day = "tuesday";
      break;
    case 3:
      day = "wednesday";
      break;
    case 4:
      day = "thursday";
      break;
    case 5:
      day = "friday";
      break;
    case 6:
      day = "saturday";
      break;
    case 7:
      day = "sunday";
      break;
  }
  return day;
};

export default getDayOfWeek;
