import { Temporal } from "proposal-temporal";

type Overload = {
  (date: string): number;
  (date: string, hour: string): number;
  //   (year: string, month: string, day: string, hour: string): number;
};

/**
 * Convert a date + hour string (YYYYMMDDHH) to a Unix time.
 *
 * @param {string} date date (YYYYMMDD) for conversion
 * @param {string} hour hour of day (0-23) for conversion
 *
 * @example convertDateToUnixTime("20210121", "11");
 * @example convertDateToUnixTime("20210121 11");
 *
 * @returns {number} converted Unix time in seconds
 */
const convertDateToUnixTime: Overload = (
  date: string,
  hour?: string
): number => {
  //   console.log(Temporal.Instant.from("20210121 11Z").epochSeconds);
  const instant = hour
    ? Temporal.Instant.from(`${date} ${hour}Z`)
    : Temporal.Instant.from(`${date}Z`);

  // Unix time (UTC)
  const utc = instant.epochSeconds;

  // Unix time (zoned to CST)
  const cst =
    Temporal.TimeZone.from("America/Chicago").getOffsetNanosecondsFor(
      instant.toString()
    ) / 1000000000;

  // GMT --> CST offset is subtracted (i.e. double negative) to effectively
  // add time to Unix timestamp; the timezone offset is reversed
  const unixTimeWithOffset = utc - cst;

  return unixTimeWithOffset;
};

// const timeThree = convertDateToUnixTime("2021", "01", "21", "11");

export default convertDateToUnixTime;
