import { describe, expect, it } from "vitest";
import { acronym } from "./acronym.js";

describe("acronym", () => {
  it("takes the first letter of each word after tokenization", () => {
    expect(acronym("Հայոց Այբուբեն Յուրահատուկ Կերտված", { alphabet: "A" })).toEqual({
      value: "ՀԱՅԿ",
      undefinedBy: [],
    });
    expect(acronym("Ուրախ օր", { alphabet: "A" })).toEqual({
      value: "ՈւՕ",
      undefinedBy: [],
    });
    expect(acronym("Ուրախ", { alphabet: "G" })).toEqual({
      value: "Ո",
      undefinedBy: [],
    });
    expect(acronym("Եվրոպա քաղաք", { alphabet: "A" }).value).toBe("ևՔ");
    expect(acronym("  հայկ   արամ  ", { alphabet: "G" }).value).toBe("ՀԱ");
  });

  it("is undefined when a word starts outside the alphabet", () => {
    expect(acronym("Ուրախ օր", { alphabet: "G" })).toEqual({
      value: null,
      undefinedBy: ["Օ"],
    });
  });
});
