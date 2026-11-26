import { describe, expect, it } from "vitest";
import { letters } from "../letters.js";
import { serial } from "../serial.js";
import { value } from "../value.js";
import { permute } from "./permute.js";

describe("permute", () => {
  it("applies Atbash within the alphabet", () => {
    expect(permute("Հայկ", "atbash", { alphabet: "G" })).toEqual({
      value: "ՅՔՀՆ",
      letters: [["Յ", "Ք", "Հ", "Ն"]],
      undefinedBy: [],
    });
    expect(permute("հայկ", "atbash", { alphabet: "A" })).toEqual({
      value: "ՈՖՃՉ",
      letters: [["Ո", "Ֆ", "Ճ", "Չ"]],
      undefinedBy: [],
    });
    expect(permute("Հուր", "atbash", { alphabet: "G" }).value).toBe("ՅԽԳԵ");
    expect(permute("Հուր", "atbash", { alphabet: "A" }).value).toBe("ՈԶԸ");
  });

  it("shifts by k and wraps", () => {
    expect(permute("Ա", { shift: 1 }, { alphabet: "G" }).value).toBe("Բ");
    expect(permute("Ա", { shift: -1 }, { alphabet: "G" }).value).toBe("Ք");
    expect(permute("Ա", { shift: 36 }, { alphabet: "G" }).value).toBe("Ա");
    expect(permute("Հայկ Հուր", { shift: 0 }, { alphabet: "G" }).value).toBe("ՀԱՅԿ ՀՈՒՐ");
  });

  it("treats Grabar albam as one self-inverse half swap", () => {
    const forward = permute("Հայկ", "albam", { alphabet: "G" }).value ?? "";
    expect(permute(forward, "albam.pivot", { alphabet: "G" }).value).toBe("ՀԱՅԿ");
    expect(permute("Ա", "albam.shift", { alphabet: "G" }).value).toBe("Ճ");
    expect(permute("Ճ", "albam", { alphabet: "G" }).value).toBe("Ա");
  });

  it("offers two Ashkharabar albam variants and no bare default", () => {
    expect(permute("Ա", "albam.pivot", { alphabet: "A" }).value).toBe("Յ");
    expect(permute("Յ", "albam.pivot", { alphabet: "A" }).value).toBe("Ա");
    expect(permute("Մ", "albam.pivot", { alphabet: "A" }).value).toBe("Մ");
    expect(permute("Ա", "albam.shift", { alphabet: "A" }).value).toBe("Մ");
    expect(permute("Մ", "albam.shift", { alphabet: "A" }).value).toBe("Ֆ");
    expect(() => permute("Ա", "albam", { alphabet: "A" })).toThrow(/albam/);
  });

  it("is undefined when a letter is undefined", () => {
    expect(permute("Օ", "atbash", { alphabet: "G" })).toEqual({
      value: null,
      letters: null,
      undefinedBy: ["Օ"],
    });
  });

  it("keeps Ashkharabar cipher letters that the string would join", () => {
    const image = permute("ՓԺ", "atbash", { alphabet: "A" });

    expect(image).toEqual({
      value: "ԵՎ",
      letters: [["Ե", "Վ"]],
      undefinedBy: [],
    });
    expect(letters(image, { alphabet: "A" })).toEqual({
      value: ["Ե", "Վ"],
      undefinedBy: [],
    });
    expect(serial(image, { alphabet: "A" })).toEqual({ value: 35, undefinedBy: [] });
    expect(serial("ԵՎ", { alphabet: "A" })).toEqual({ value: 37, undefinedBy: [] });
    expect(value(image, { alphabet: "A" })).toEqual({ value: 3005, undefinedBy: [] });
    expect(permute(image, "atbash", { alphabet: "A" })).toEqual({
      value: "ՓԺ",
      letters: [["Փ", "Ժ"]],
      undefinedBy: [],
    });
  });
});
