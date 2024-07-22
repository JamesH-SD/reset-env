import { chunkArray } from "../../lambda/reset-env/lib/utils";

describe("chunkArray", () => {
  it("should chunk array into smaller arrays", () => {
    const arr = [1, 2, 3, 4, 5];
    const size = 2;
    const result = chunkArray(arr, size);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should return empty array when input array is empty", () => {
    const arr: number[] = [];
    const size = 2;
    const result = chunkArray(arr, size);
    expect(result).toEqual([]);
  });

  it("should return single chunk when size is larger than array length", () => {
    const arr = [1, 2, 3];
    const size = 5;
    const result = chunkArray(arr, size);
    expect(result).toEqual([[1, 2, 3]]);
  });
});
