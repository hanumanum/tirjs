import { describe, expect, it } from "vitest";
import { serial } from "./serial.js";

describe("serial", () => {
  it("sums alphabet positions", () => {
    expect(serial("Հայկ", { alphabet: "G" })).toEqual({
      value: 53,
      undefinedBy: [],
    });
    expect(serial("Հուր", { alphabet: "G" })).toEqual({
      value: 106,
      undefinedBy: [],
    });
    expect(serial("Հուր", { alphabet: "A" })).toEqual({
      value: 82,
      undefinedBy: [],
    });
  });

  it("gives և a position in Ashkharabar and two positions in Grabar", () => {
    expect(serial("և", { alphabet: "A" }).value).toBe(37);
    expect(serial("և", { alphabet: "G" }).value).toBe(39);
  });

  it("is undefined when tokenization is undefined", () => {
    expect(serial("օր", { alphabet: "G" })).toEqual({
      value: null,
      undefinedBy: ["Օ"],
    });
  });
});
