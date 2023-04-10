/**
 * Obtain a random integer.
 * @param min minimum value (inclusive)
 * @param max maximum value (exclusive)
 * @returns random integer in range [min,max)
 */
const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  let num = Math.floor(Math.random() * (max - min + 1)) + min;

  return num;
};

export default getRandomInt;
