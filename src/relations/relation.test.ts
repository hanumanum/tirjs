import { describe, expect, it } from "vitest";
import { permute } from "../ciphers/permute.js";
import { isAnagram, sameColumnSum, sameSerial, sameValue } from "./relation.js";

describe("isAnagram", () => {
  it("compares letter multisets after tokenization", () => {
    expect(isAnagram("Հայկ", "կայՀ", { alphabet: "G" })).toEqual({
      value: true,
      undefinedBy: [],
    });
    expect(isAnagram("Հայկ", "Հայ", { alphabet: "G" }).value).toBe(false);
    expect(isAnagram("եւ", "եվ", { alphabet: "A" }).value).toBe(true);
    expect(isAnagram("եւ", "եվ", { alphabet: "G" }).value).toBe(false);
    expect(isAnagram("ու", "ՈՒ", { alphabet: "G" }).value).toBe(true);
    expect(isAnagram("ու", "ՈՒ", { alphabet: "A" }).value).toBe(true);
  });

  it("is undefined when either side has a letter outside the alphabet", () => {
    expect(isAnagram("Օ", "Ֆ", { alphabet: "G" })).toEqual({
      value: null,
      undefinedBy: ["Օ", "Ֆ"],
    });
  });
});

describe("same value relations", () => {
  it("compares numeric, column, and serial totals", () => {
    expect(sameValue("Հայկ", "հայկ", { alphabet: "G" })).toEqual({
      value: true,
      undefinedBy: [],
    });
    expect(sameValue("Ա", "Բ", { alphabet: "G" }).value).toBe(false);
    expect(sameValue("Հուր", "Հուր", { alphabet: "A", mode: "decompose" }).value).toBe(true);
    expect(sameColumnSum("Արամ", "Ք", { alphabet: "G" })).toEqual({
      value: true,
      undefinedBy: [],
    });
    expect(sameSerial("Հուր", "Հուր", { alphabet: "A" }).value).toBe(true);
    expect(sameSerial("Ա", "Բ", { alphabet: "G" }).value).toBe(false);
  });

  it("compares a cipher image by its letters", () => {
    const image = permute("ՓԺ", "atbash", { alphabet: "A" });

    expect(sameSerial(image, "ԵՎ", { alphabet: "A" })).toEqual({
      value: false,
      undefinedBy: [],
    });
    expect(isAnagram(image, "ՎԵ", { alphabet: "A" })).toEqual({
      value: true,
      undefinedBy: [],
    });
    expect(sameValue(image, "ԵՎ", { alphabet: "A", mode: "decompose" })).toEqual({
      value: false,
      undefinedBy: [],
    });
  });

  it("names the letter that makes a strict comparison undefined", () => {
    expect(sameValue("Հուր", "Հուր", { alphabet: "A", mode: "strict" })).toEqual({
      value: null,
      undefinedBy: ["Ու"],
    });
    expect(() => sameColumnSum("Հուր", "Հուր", { alphabet: "A" })).toThrow(/mode/);
  });
});
