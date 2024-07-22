/**
 * Function to chunk array into smaller arrays
 * @param {T[]} arr - Array to be chunked
 * @param {number} size - Size of each chunk
 * @returns {T[][]} - Array of chunks
 * @example
 * chunkArray([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 **/
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};
