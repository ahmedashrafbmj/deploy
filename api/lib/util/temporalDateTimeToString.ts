import { Temporal } from "proposal-temporal";

/**
 * Convert a Temporal time to a formatted string (YYYYMMDD HH).
 *
 * @param temporalTime Temporal time to convert
 */
const temporalDateTimeToString = (
  temporalTime: Temporal.PlainDateTime
): string => {
  return `${temporalTime.year}${temporalTime.month
    .toString()
    .padStart(2, "0")}${temporalTime.day
    .toString()
    .padStart(2, "0")} ${temporalTime.hour.toString().padStart(2, "0")}`;
};

export default temporalDateTimeToString;
