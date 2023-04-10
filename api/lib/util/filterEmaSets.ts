import moment from "moment";

/**
 * Filter EMA sets based on valid completions.
 * Check a datetime tolerance for complete EMA submissions.
 *
 * @param {{ createdAt: Date }[]} completedSets array of completed set timestamps
 * @returns {number} number of valid sets
 */
const filterEmaSets = (completedSets: { createdAt: Date }[]): number => {
  // get array of just dates (not nested in objects), converted to moments
  const mappedSets = completedSets.map(({ createdAt }) => moment(createdAt));

  let validSetCount = 0;
  // TODO edge case for first element
  mappedSets.forEach(function (item, idx) {
    // edge case: count first set if valid against next
    if (idx === 0) {
      const timeDiff = item.diff(mappedSets[idx + 1], "seconds");
      // increment valid sets if > 300 second time difference first and second submission
      if (Math.abs(timeDiff) > 300) validSetCount++;
    } else if (idx > 0) {
      const timeDiff = item.diff(mappedSets[idx - 1], "seconds");

      // increment valid sets if > 300 second time difference between submissions
      if (Math.abs(timeDiff) > 300) validSetCount++;
    }
  });

  return validSetCount;
};

export default filterEmaSets;
