import { describe, expect, it } from "vitest";
import { columnSum, columnSumAll } from "./column.js";
import { reduce } from "./reduce.js";
import { value } from "./value.js";

describe("columnSum", () => {
  it("sums column digits without reducing them", () => {
    expect(columnSum("Հայկ", { alphabet: "G" })).toEqual({
      value: 17,
      undefinedBy: [],
    });
    expect(columnSum("Արամ", { alphabet: "G" })).toEqual({
      value: 9,
      undefinedBy: [],
    });
    expect(columnSum("Հուր", { alphabet: "G" })).toEqual({
      value: 25,
      undefinedBy: [],
    });
    expect(columnSum("ՅՔՀՆ", { alphabet: "G" })).toEqual({
      value: 23,
      undefinedBy: [],
    });
  });

  it("uses the mode column of an Ashkharabar-only letter", () => {
    expect(columnSum("Հուր", { alphabet: "A", mode: "decompose" }).value).toBe(25);
    expect(columnSum("Հուր", { alphabet: "A", mode: "inherit" }).value).toBe(19);
    expect(columnSum("Հուր", { alphabet: "A", mode: "strict" })).toEqual({
      value: null,
      undefinedBy: ["Ու"],
    });
    expect(columnSum("և", { alphabet: "G" }).value).toBe(12);
    expect(columnSum("և", { alphabet: "A", mode: "decompose" }).value).toBe(12);
    expect(() => columnSum("Հուր", { alphabet: "A" })).toThrow(/mode/);
  });

  it("spreads column sums across modes", () => {
    expect(columnSumAll("Հուր", { alphabet: "A" })).toEqual({
      decompose: { value: 25, undefinedBy: [] },
      inherit: { value: 19, undefinedBy: [] },
      strict: { value: null, undefinedBy: ["Ու"] },
    });
  });

  it("reduces to the same digit as the numeric value", () => {
    const numeric = value("Հայկ", { alphabet: "G" }).value ?? 0;
    const column = columnSum("Հայկ", { alphabet: "G" }).value ?? 0;
    expect(reduce(numeric)).toBe(8);
    expect(reduce(column)).toBe(8);
  });
});
