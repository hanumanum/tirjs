import { describe, expect, it } from "vitest";
import { derive } from "./derive.js";

const hur = [
  { op: "alphabet", alphabet: "G" },
  { op: "tokenize", text: "Հուր" },
  { op: "value", line: 1 },
  { op: "reduce", line: 2 },
  { op: "column", line: 1 },
  { op: "serial", line: 1 },
  { op: "reduce", line: 5 },
  { op: "cipher", line: 1, cipher: "atbash" },
  { op: "value", line: 7 },
  { op: "alphabet", alphabet: "A" },
  { op: "tokenize", text: "Հուր" },
  { op: "value", line: 9, mode: "*" },
  { op: "column", line: 9, mode: "*" },
  { op: "serial", line: 9 },
  { op: "same", by: "value", left: 2, right: 10 },
] as const;

describe("derive", () => {
  it("writes the Հուր derivation in Unicode", () => {
    expect(derive(hur, { format: "unicode" })).toBe(
      [
        "alphabet ᴳ",
        "1. ⟨Հուր⟩ᴳ = Հ·Ո·Ւ·Ր    given; tokenize",
        "2. #⟨Հուր⟩ᴳ = 70+600+7000+5000 = 12670    #, 1",
        "3. #₁⟨Հուր⟩ᴳ = 12670 ⟶ 16 ⟶ 7    reduce, 2",
        "4. #ₖ⟨Հուր⟩ᴳ = 7+6+7+5 = 25    column sum, 1",
        "5. №⟨Հուր⟩ᴳ = 16+24+34+32 = 106    №, 1",
        "6. №₁⟨Հուր⟩ᴳ = 106 ⟶ 7    reduce, 5",
        "7. σ:atbash ⟨Հուր⟩ᴳ = ⟨ՅԽԳԵ⟩ᴳ    atbash (i ↦ 37−i), 1",
        "8. #⟨ՅԽԳԵ⟩ᴳ = 300+40+3+5 = 348    #, 7",
        "alphabet ᴬ",
        "9. ⟨Հուր⟩ᴬ = Հ·Ու·Ր    given; tokenize",
        "10. #*⟨Հուր⟩ᴬ = { ᵈ 12670 · ⁱ 12070 · ˢ ⊥(Ու) }    spread, 9",
        "11. #*ₖ⟨Հուր⟩ᴬ = { ᵈ 25 · ⁱ 19 · ˢ ⊥(Ու) }    column sum, 9",
        "12. №⟨Հուր⟩ᴬ = 16+34+32 = 82    №, 9",
        "13. ⟨Հուր⟩ᴳ ≡# ⟨Հուր⟩ᴬ under ᵈ only    2, 10",
      ].join("\n"),
    );
  });

  it("writes the same derivation in ASCII", () => {
    expect(derive(hur, { format: "ascii" })).toBe(
      [
        "alphabet G",
        "1. <Հուր>G = Հ.Ո.Ւ.Ր    given; tokenize",
        "2. #<Հուր>G = 70+600+7000+5000 = 12670    #, 1",
        "3. #1<Հուր>G = 12670 -> 16 -> 7    reduce, 2",
        "4. #k<Հուր>G = 7+6+7+5 = 25    column sum, 1",
        "5. N<Հուր>G = 16+24+34+32 = 106    N, 1",
        "6. N1<Հուր>G = 106 -> 7    reduce, 5",
        "7. atbash <Հուր>G = <ՅԽԳԵ>G    atbash (i -> 37-i), 1",
        "8. #<ՅԽԳԵ>G = 300+40+3+5 = 348    #, 7",
        "alphabet A",
        "9. <Հուր>A = Հ.Ու.Ր    given; tokenize",
        "10. #*<Հուր>A = { d 12670 . i 12070 . s _|_(Ու) }    spread, 9",
        "11. #*k<Հուր>A = { d 25 . i 19 . s _|_(Ու) }    column sum, 9",
        "12. N<Հուր>A = 16+34+32 = 82    N, 9",
        "13. <Հուր>G =# <Հուր>A under d only    2, 10",
      ].join("\n"),
    );
  });

  it("records Atbash of Հայկ and a shift", () => {
    expect(
      derive(
        [
          { op: "alphabet", alphabet: "G" },
          { op: "tokenize", text: "Հայկ" },
          { op: "cipher", line: 1, cipher: "atbash" },
          { op: "value", line: 2 },
          { op: "reduce", line: 3 },
          { op: "column", line: 2 },
          { op: "cipher", line: 1, cipher: { shift: -1 } },
        ],
        { format: "ascii" },
      ),
    ).toBe(
      [
        "alphabet G",
        "1. <Հայկ>G = Հ.Ա.Յ.Կ    given; tokenize",
        "2. atbash <Հայկ>G = <ՅՔՀՆ>G    atbash (i -> 37-i), 1",
        "3. #<ՅՔՀՆ>G = 300+9000+70+400 = 9770    #, 2",
        "4. #1<ՅՔՀՆ>G = 9770 -> 23 -> 5    reduce, 3",
        "5. #k<ՅՔՀՆ>G = 3+9+7+4 = 23    column sum, 2",
        "6. shift-1 <Հայկ>G = <ԿՔՄԾ>G    shift-1, 1",
      ].join("\n"),
    );
  });

  it("names a strict gap, an acronym, and an expansion", () => {
    expect(
      derive(
        [
          { op: "alphabet", alphabet: "A" },
          { op: "tokenize", text: "Հուր" },
          { op: "value", line: 1, mode: "strict" },
          { op: "acronym", text: "Ուրախ օր" },
          {
            op: "expand",
            text: "ՀԱՅԿ",
            lexicon: {
              name: "sample",
              phrases: ["Հայոց Այբուբեն Յուրահատուկ Կերտված"],
            },
          },
        ],
        { format: "unicode" },
      ),
    ).toBe(
      [
        "alphabet ᴬ",
        "1. ⟨Հուր⟩ᴬ = Հ·Ու·Ր    given; tokenize",
        "2. #ˢ⟨Հուր⟩ᴬ = ⊥(Ու)    #ˢ, 1",
        "3. ↑⟨Ուրախ օր⟩ᴬ = ⟨ՈւՕ⟩ᴬ    acronym",
        "4. ↓[dict:sample]⟨ՀԱՅԿ⟩ᴬ = ⟨Հայոց Այբուբեն Յուրահատուկ Կերտված⟩ᴬ    dict:sample",
      ].join("\n"),
    );
  });

  it("requires an alphabet on the derivation", () => {
    expect(() => derive([{ op: "tokenize", text: "Հայկ" }], { format: "unicode" })).toThrow(
      /alphabet/,
    );
  });
});
