import { describe, expect, it } from "vitest";
import { letters, tokenize } from "./letters.js";

describe("letters", () => {
  it("splits Grabar into one letter per character", () => {
    expect(letters("Հայկ", { alphabet: "G" })).toEqual({
      value: ["Հ", "Ա", "Յ", "Կ"],
      undefinedBy: [],
    });
    expect(letters("լոյս", { alphabet: "G" })).toEqual({
      value: ["Լ", "Ո", "Յ", "Ս"],
      undefinedBy: [],
    });
    expect(letters("ու", { alphabet: "G" })).toEqual({
      value: ["Ո", "Ւ"],
      undefinedBy: [],
    });
  });

  it("writes the Grabar ligature և out as Ե and Ւ", () => {
    expect(letters("և", { alphabet: "G" })).toEqual({
      value: ["Ե", "Ւ"],
      undefinedBy: [],
    });
    expect(letters("եւ", { alphabet: "G" })).toEqual({
      value: ["Ե", "Ւ"],
      undefinedBy: [],
    });
    expect(letters("եվ", { alphabet: "G" })).toEqual({
      value: ["Ե", "Վ"],
      undefinedBy: [],
    });
  });

  it("reads every Ashkharabar spelling of Ու and և as one letter", () => {
    expect(letters("ու", { alphabet: "A" })).toEqual({
      value: ["Ու"],
      undefinedBy: [],
    });
    expect(letters("Ու", { alphabet: "A" }).value).toEqual(["Ու"]);
    expect(letters("ՈՒ", { alphabet: "A" }).value).toEqual(["Ու"]);
    expect(letters("ոՒ", { alphabet: "A" }).value).toEqual(["Ու"]);

    for (const spelling of ["և", "եւ", "Եւ", "ԵՒ", "եվ", "Եվ", "ԵՎ"]) {
      expect(letters(spelling, { alphabet: "A" }).value).toEqual(["և"]);
    }

    expect(letters("Եվրոպա", { alphabet: "A" })).toEqual({
      value: ["և", "Ր", "Ո", "Պ", "Ա"],
      undefinedBy: [],
    });
    expect(letters("Երեվան", { alphabet: "A" }).value).toEqual(["Ե", "Ր", "և", "Ա", "Ն"]);
    expect(letters("լույս", { alphabet: "A" }).value).toEqual(["Լ", "Ու", "Յ", "Ս"]);
  });

  it("names a letter the alphabet does not contain", () => {
    expect(letters("ւ", { alphabet: "A" })).toEqual({
      value: null,
      undefinedBy: ["Ւ"],
    });
    expect(letters("Օ", { alphabet: "G" })).toEqual({
      value: null,
      undefinedBy: ["Օ"],
    });
    expect(letters("Ֆօ", { alphabet: "G" })).toEqual({
      value: null,
      undefinedBy: ["Ֆ", "Օ"],
    });
    expect(letters("ՀայկX", { alphabet: "G" })).toEqual({
      value: null,
      undefinedBy: ["X"],
    });
  });

  it("ignores punctuation and digits, and splits words on spaces", () => {
    expect(letters("Հայկ։ 2", { alphabet: "G" })).toEqual({
      value: ["Հ", "Ա", "Յ", "Կ"],
      undefinedBy: [],
    });
    expect(tokenize("Հայկ  Արամ", "G")).toEqual({
      value: [
        ["Հ", "Ա", "Յ", "Կ"],
        ["Ա", "Ր", "Ա", "Մ"],
      ],
      undefinedBy: [],
    });
    expect(letters("", { alphabet: "A" })).toEqual({
      value: [],
      undefinedBy: [],
    });
  });
});
