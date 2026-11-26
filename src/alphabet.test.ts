import { describe, expect, it } from "vitest";
import { alphabetSize, columnOf, letterAt, numericOf } from "./alphabet.js";

const classic = (position: number): { readonly numeric: number; readonly column: number } => {
  const row = Math.floor((position - 1) / 9);
  const column = ((position - 1) % 9) + 1;
  return { numeric: column * 10 ** row, column };
};

describe("alphabet table", () => {
  it("lists 36 Grabar letters and 39 Ashkharabar letters", () => {
    expect(alphabetSize("G")).toBe(36);
    expect(alphabetSize("A")).toBe(39);
    expect(letterAt("G", 37)).toBeNull();
  });

  it("keeps the classic grid for every Grabar letter", () => {
    for (let position = 1; position <= 36; position += 1) {
      const letter = letterAt("G", position);
      const expected = classic(position);
      expect(letter).not.toBeNull();
      expect(numericOf(letter ?? "", "G")).toBe(expected.numeric);
      expect(columnOf(letter ?? "", "G")).toBe(expected.column);
    }
  });

  it("places the Ashkharabar-only letters after the shared 33", () => {
    expect(letterAt("G", 34)).toBe("Ւ");
    expect(letterAt("A", 34)).toBe("Ու");
    expect(letterAt("A", 35)).toBe("Փ");
    expect(letterAt("A", 36)).toBe("Ք");
    expect(letterAt("A", 37)).toBe("և");
    expect(letterAt("A", 38)).toBe("Օ");
    expect(letterAt("A", 39)).toBe("Ֆ");
    expect(numericOf("Փ", "A")).toBe(8000);
    expect(numericOf("Ք", "A")).toBe(9000);
  });

  it("keeps three equal numeric modes for Ու, և, Օ, and Ֆ", () => {
    expect(numericOf("Ու", "A", "decompose")).toBe(7600);
    expect(numericOf("Ու", "A", "inherit")).toBe(7000);
    expect(numericOf("Ու", "A", "strict")).toBeNull();
    expect(columnOf("Ու", "A", "decompose")).toBe(13);
    expect(columnOf("Ու", "A", "inherit")).toBe(7);

    expect(numericOf("և", "A", "decompose")).toBe(7005);
    expect(numericOf("և", "A", "inherit")).toBe(0);
    expect(columnOf("և", "A", "decompose")).toBe(12);
    expect(columnOf("և", "A", "inherit")).toBe(0);

    expect(numericOf("Օ", "A", "decompose")).toBe(0);
    expect(numericOf("Ֆ", "A", "inherit")).toBe(0);
    expect(columnOf("Օ", "A", "decompose")).toBe(0);
    expect(numericOf("Ֆ", "A", "strict")).toBeNull();
    expect(columnOf("և", "A", "strict")).toBeNull();
  });

  it("requires a mode for letters whose numeric value is not classic", () => {
    expect(() => numericOf("Ու", "A")).toThrow(/mode/);
    expect(() => columnOf("Օ", "A")).toThrow(/mode/);
  });
});
