import { describe, expect, it } from "vitest";
import { value, valueAll } from "./value.js";

describe("value", () => {
  it("sums classic numeric values", () => {
    expect(value("Հայկ", { alphabet: "G" })).toEqual({
      value: 431,
      undefinedBy: [],
    });
    expect(value("հայկ", { alphabet: "A" })).toEqual({
      value: 431,
      undefinedBy: [],
    });
    expect(value("Արամ", { alphabet: "G" })).toEqual({
      value: 5202,
      undefinedBy: [],
    });
    expect(value("Հուր", { alphabet: "G" })).toEqual({
      value: 12670,
      undefinedBy: [],
    });
  });

  it("keeps decompose, inherit, and strict equal in status", () => {
    expect(value("Հուր", { alphabet: "A", mode: "decompose" })).toEqual({
      value: 12670,
      undefinedBy: [],
    });
    expect(value("Հուր", { alphabet: "A", mode: "inherit" })).toEqual({
      value: 12070,
      undefinedBy: [],
    });
    expect(value("Հուր", { alphabet: "A", mode: "strict" })).toEqual({
      value: null,
      undefinedBy: ["Ու"],
    });
    expect(value("և", { alphabet: "G" }).value).toBe(7005);
    expect(value("և", { alphabet: "A", mode: "decompose" }).value).toBe(7005);
    expect(value("եւ", { alphabet: "A", mode: "inherit" }).value).toBe(0);
    expect(value("եվ", { alphabet: "G" }).value).toBe(3005);
    expect(value("Օֆ", { alphabet: "A", mode: "decompose" }).value).toBe(0);
    expect(value("Օֆ", { alphabet: "A", mode: "strict" })).toEqual({
      value: null,
      undefinedBy: ["Օ", "Ֆ"],
    });
  });

  it("refuses to pick a mode when an Ashkharabar word needs one", () => {
    expect(() => value("Հուր", { alphabet: "A" })).toThrow(/mode/);
    expect(value("Հուր", { alphabet: "G", mode: "strict" }).value).toBe(12670);
  });

  it("spreads every mode, including a named gap", () => {
    expect(valueAll("Հուր", { alphabet: "A" })).toEqual({
      decompose: { value: 12670, undefinedBy: [] },
      inherit: { value: 12070, undefinedBy: [] },
      strict: { value: null, undefinedBy: ["Ու"] },
    });
    expect(valueAll("Հուր", { alphabet: "G" })).toEqual({
      decompose: { value: 12670, undefinedBy: [] },
      inherit: { value: 12670, undefinedBy: [] },
      strict: { value: 12670, undefinedBy: [] },
    });
    expect(valueAll("Օ", { alphabet: "G" }).decompose).toEqual({
      value: null,
      undefinedBy: ["Օ"],
    });
  });
});
