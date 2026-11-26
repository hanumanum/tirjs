import { describe, expect, it } from "vitest";
import { reduce, reduceTrace } from "./reduce.js";

describe("reduce", () => {
  it("sums digits until one digit remains", () => {
    expect(reduce(431)).toBe(8);
    expect(reduce(12670)).toBe(7);
    expect(reduce(9770)).toBe(5);
    expect(reduce(106)).toBe(7);
    expect(reduce(17)).toBe(8);
    expect(reduce(8)).toBe(8);
    expect(reduce(0)).toBe(0);
  });

  it("keeps each intermediate total", () => {
    expect(reduceTrace(12670)).toEqual([12670, 16, 7]);
    expect(reduceTrace(9770)).toEqual([9770, 23, 5]);
    expect(reduceTrace(106)).toEqual([106, 7]);
    expect(reduceTrace(8)).toEqual([8]);
  });

  it("accepts only integers", () => {
    expect(() => reduce(1.5)).toThrow(/integer/);
  });
});
