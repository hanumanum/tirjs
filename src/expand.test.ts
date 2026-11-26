import { describe, expect, it } from "vitest";
import { expand } from "./expand.js";

const lexicon = {
  name: "sample",
  phrases: [
    "այլ բան",
    "Հայոց Այբուբեն Յուրահատուկ Կերտված",
    "հայր արքա յոյն կին",
  ],
};

describe("expand", () => {
  it("finds phrases in a caller-supplied lexicon whose acronym is the word", () => {
    expect(expand("հայկ", lexicon, { alphabet: "A" })).toEqual({
      value: ["Հայոց Այբուբեն Յուրահատուկ Կերտված", "հայր արքա յոյն կին"],
      undefinedBy: [],
    });
    expect(expand("ՀԱՅ", lexicon, { alphabet: "A" })).toEqual({
      value: [],
      undefinedBy: [],
    });
  });

  it("leaves the lexicon unchanged", () => {
    const phrases = ["Հայոց Այբուբեն Յուրահատուկ Կերտված"];
    const supplied = { name: "sample", phrases };
    expand("ՀԱՅԿ", supplied, { alphabet: "A" });
    expect(supplied.phrases).toBe(phrases);
  });

  it("is undefined when the word is undefined in the alphabet", () => {
    expect(expand("Օ", lexicon, { alphabet: "G" })).toEqual({
      value: null,
      undefinedBy: ["Օ"],
    });
  });
});
