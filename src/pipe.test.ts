import { describe, expect, it } from "vitest";
import { pipe } from "./pipe.js";

describe("pipe", () => {
  it("returns the value when no functions are given", () => {
    expect(pipe(1)).toBe(1);
  });

  it("threads the value through each function", () => {
    const result = pipe(
      2,
      (n) => n + 1,
      (n) => n * 4,
      (n) => `n=${n}`,
    );

    expect(result).toBe("n=12");
  });

  it("passes a new value forward and leaves the input unchanged", () => {
    const input = { count: 1 };

    const result = pipe(
      input,
      (current) => ({ ...current, count: current.count + 1 }),
      (current) => ({ ...current, count: current.count + 1 }),
    );

    expect(input).toEqual({ count: 1 });
    expect(result).toEqual({ count: 3 });
  });
});
