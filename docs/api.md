# tirjs function reference

How to call the TirN operations. The notation itself — symbols, letter table, and the rules these functions follow — is [TIRN](TIRN.md). Letter numbers live in [`knowledge/alphabets.json`](../knowledge/alphabets.json).

Every example below is plain JavaScript. The same calls work from `require("tirjs")`. The comment above a call is the TirN line it evaluates. [Ciphers](ciphers.md), [acronyms](acronyms.md), and [relations](relations.md) have their own pages.

```javascript
import { columnSum, columnSumAll, derive, letters, reduce, serial, value, valueAll } from "tirjs";
```

## Contents

- [Shared rules](#shared-rules)
- [Types](#types)
- [`letters`](#letters)
- [`value`](#value)
- [`valueAll`](#valueall)
- [`columnSum`](#columnsum)
- [`columnSumAll`](#columnsumall)
- [`serial`](#serial)
- [`reduce`](#reduce)
- [More examples](#more-examples)
- [Ciphers](ciphers.md) — `permute`
- [Acronyms](acronyms.md) — `acronym`, `expand`
- [Relations](relations.md) — `isAnagram`, `sameValue`, `sameColumnSum`, `sameSerial`
- [`derive`](#derive)

## Shared rules

**Alphabet.** Text functions take `{ alphabet: "G" }` or `{ alphabet: "A" }`. `"G"` is Grabar, 36 letters. `"A"` is Ashkharabar, 39 letters. Any other alphabet throws `alphabet must be G or A`.

**Case.** Upper and lower case are the same letter. Results are written in canonical form: `Ա` … `Ք`, plus `Ու` and `և` where those are single letters.

**Spaces, punctuation, digits.** Spaces separate words. Punctuation, symbols, digits, and combining marks are skipped. They do not become letters and they do not make a result undefined.

**Undefined, ⊥.** A letter the chosen alphabet does not contain makes the whole result undefined. So does strict mode, once a tokenized letter has no numeric value. The return is one object either way:

```typescript
type Defined<T> = {
  readonly value: T | null;
  readonly undefinedBy: readonly string[];
};
```

`value === null` means undefined. `undefinedBy` lists the responsible letters once each, in the order they first appear. `0`, `""`, and `[]` are defined results, and their `undefinedBy` is `[]`.

A letter outside the alphabet fails at tokenization, before any numeric mode is applied. `Օ` in Grabar is undefined in every mode. `Ու` in Ashkharabar tokenizes, and only strict mode then makes its number undefined.

**Numeric mode.** `Ու`, `և`, `Օ`, and `Ֆ` have no single classic number. `value`, `columnSum`, `sameValue`, and `sameColumnSum` require `mode` when an Ashkharabar text contains one of them. The missing mode throws `Ashkharabar letters Ու, և, Օ, and Ֆ need a numeric mode`. Grabar has none of these letters, so a mode passed there does not change the result. An Ashkharabar text that avoids those letters does not need a mode either.

| Mode | `Ու` number / column | `և` number / column | `Օ`, `Ֆ` number / column |
|---|---:|---:|---:|
| `"decompose"` | 7600 / 13 | 7005 / 12 | 0 / 0 |
| `"inherit"` | 7000 / 7 | 0 / 0 | 0 / 0 |
| `"strict"` | undefined | undefined | undefined |

Decompose rebuilds `Ու` as `Ո+Ւ` and `և` as `Ե+Ւ`. Inherit reads `Ու` as `Ւ` and gives `և`, `Օ`, and `Ֆ` a zero. Strict leaves all four undefined.

**Empty text.** No letters is a defined, empty total.

| Call | Result |
|---|---|
| `letters("", { alphabet })` | `{ value: [], undefinedBy: [] }` |
| `value`, `columnSum`, `serial` | `{ value: 0, undefinedBy: [] }` |
| `acronym` | `{ value: "", undefinedBy: [] }` |
| `permute` | `{ value: "", undefinedBy: [] }` |

## Types

```typescript
type Alphabet = "G" | "A";

type NumericMode = "decompose" | "inherit" | "strict";

type Defined<T> = {
  readonly value: T | null;
  readonly undefinedBy: readonly string[];
};

type Cipher =
  | "atbash"
  | "albam"
  | "albam.pivot"
  | "albam.shift"
  | { readonly shift: number };

type Lexicon = {
  readonly name: string;
  readonly phrases: readonly string[];
};
```

`DerivationStep` is listed under [`derive`](#derive).

## `letters`

```typescript
letters(text: string, options: { alphabet: Alphabet }): Defined<readonly string[]>
```

Splits text into canonical letters. The array is flat: spaces are boundaries, and the letters of every word are concatenated. The TirN line is `⟨text⟩` with the alphabet mark. Word boundaries stay available to [`acronym`](acronyms.md#acronym), [`expand`](acronyms.md#expand), and [`permute`](ciphers.md).

Grabar reads every character as its own letter. The ligature `և` is `Ե` then `Ւ`. `ու` is `Ո` then `Ւ`. `եվ` is `Ե` then `Վ`.

Ashkharabar reads these spellings, in any case, as one letter:

| Letter | Spellings |
|---|---|
| `Ու` | `ու`, `Ու`, `ՈՒ`, `ոՒ` |
| `և` | `և`, `եւ`, `Եւ`, `ԵՒ`, `եվ`, `Եվ`, `ԵՎ` |

Every `եվ` in Ashkharabar is `և`, so `Եվրոպա` starts with `և`. A `ւ` that is not the second half of `ու` or `եւ` is undefined. `Օ` and `Ֆ` are letters in Ashkharabar and undefined in Grabar.

```javascript
// ⟨Հայկ⟩ᴳ = Հ·Ա·Յ·Կ
letters("Հայկ", { alphabet: "G" });
// { value: ["Հ", "Ա", "Յ", "Կ"], undefinedBy: [] }

// ⟨լոյս⟩ᴳ = Լ·Ո·Յ·Ս
letters("լոյս", { alphabet: "G" });
// { value: ["Լ", "Ո", "Յ", "Ս"], undefinedBy: [] }

// ⟨ու⟩ᴳ = Ո·Ւ
letters("ու", { alphabet: "G" });
// { value: ["Ո", "Ւ"], undefinedBy: [] }

// ⟨ու⟩ᴬ = Ու
letters("ու", { alphabet: "A" });
// { value: ["Ու"], undefinedBy: [] }

// ⟨լույս⟩ᴬ = Լ·Ու·Յ·Ս
letters("լույս", { alphabet: "A" });
// { value: ["Լ", "Ու", "Յ", "Ս"], undefinedBy: [] }

// ⟨Եվրոպա⟩ᴬ = և·Ր·Ո·Պ·Ա
letters("Եվրոպա", { alphabet: "A" });
// { value: ["և", "Ր", "Ո", "Պ", "Ա"], undefinedBy: [] }

// ⟨Երեվան⟩ᴬ = Ե·Ր·և·Ա·Ն
letters("Երեվան", { alphabet: "A" });
// { value: ["Ե", "Ր", "և", "Ա", "Ն"], undefinedBy: [] }

// ⟨և⟩ᴳ = Ե·Ւ
letters("և", { alphabet: "G" });
// { value: ["Ե", "Ւ"], undefinedBy: [] }

// ⟨եվ⟩ᴳ = Ե·Վ
letters("եվ", { alphabet: "G" });
// { value: ["Ե", "Վ"], undefinedBy: [] }

// ⟨Հայկ։ 2⟩ᴳ = Հ·Ա·Յ·Կ
letters("Հայկ։ 2", { alphabet: "G" });
// { value: ["Հ", "Ա", "Յ", "Կ"], undefinedBy: [] }

// ⟨ւ⟩ᴬ = ⊥(Ւ)
letters("ւ", { alphabet: "A" });
// { value: null, undefinedBy: ["Ւ"] }

// ⟨Ֆօ⟩ᴳ = ⊥(Ֆ, Օ)
letters("Ֆօ", { alphabet: "G" });
// { value: null, undefinedBy: ["Ֆ", "Օ"] }
```

## `value`

```typescript
value(
  text: string,
  options: { alphabet: Alphabet; mode?: NumericMode },
): Defined<number>
```

Sums the classic numeric value of each letter. Grabar `Հայկ` is `70+1+300+60`.

```javascript
// #⟨Հայկ⟩ᴳ = 431
value("Հայկ", { alphabet: "G" });
// { value: 431, undefinedBy: [] }

// #⟨հայկ⟩ᴬ = 431
value("հայկ", { alphabet: "A" });
// { value: 431, undefinedBy: [] }

// #⟨Արամ⟩ᴳ = 5202
value("Արամ", { alphabet: "G" });
// { value: 5202, undefinedBy: [] }

// #⟨Հուր⟩ᴳ = 12670
value("Հուր", { alphabet: "G" });
// { value: 12670, undefinedBy: [] }
```

Ashkharabar `Հուր` is `Հ·Ու·Ր`. The three modes are equal in status, and the caller writes the one being used:

```javascript
// #ᵈ⟨Հուր⟩ᴬ = 12670
value("Հուր", { alphabet: "A", mode: "decompose" });
// { value: 12670, undefinedBy: [] }

// #ⁱ⟨Հուր⟩ᴬ = 12070
value("Հուր", { alphabet: "A", mode: "inherit" });
// { value: 12070, undefinedBy: [] }

// #ˢ⟨Հուր⟩ᴬ = ⊥(Ու)
value("Հուր", { alphabet: "A", mode: "strict" });
// { value: null, undefinedBy: ["Ու"] }

// #ᵈ⟨Օֆ⟩ᴬ = 0
value("Օֆ", { alphabet: "A", mode: "decompose" });
// { value: 0, undefinedBy: [] }

// #ˢ⟨Օֆ⟩ᴬ = ⊥(Օ, Ֆ)
value("Օֆ", { alphabet: "A", mode: "strict" });
// { value: null, undefinedBy: ["Օ", "Ֆ"] }
```

`value("Հուր", { alphabet: "A" })` throws, because `Ու` is present and `mode` is absent. `value("Հուր", { alphabet: "G", mode: "strict" })` is `12670`: Grabar has no mode-dependent letter, so the modes agree.

The ligature and the two-character spellings follow tokenization first:

```javascript
// #⟨և⟩ᴳ = 7005
value("և", { alphabet: "G" }).value;
// 7005, from Ե + Ւ

// #ᵈ⟨և⟩ᴬ = 7005
value("և", { alphabet: "A", mode: "decompose" }).value;
// 7005

// #ⁱ⟨եւ⟩ᴬ = 0
value("եւ", { alphabet: "A", mode: "inherit" }).value;
// 0

// #⟨եվ⟩ᴳ = 3005
value("եվ", { alphabet: "G" }).value;
// 3005, from Ե + Վ
```

A tokenization failure is returned as-is. `#⟨Օ⟩ᴳ = ⊥(Օ)`, and `value("Օ", { alphabet: "G", mode: "decompose" })` is `{ value: null, undefinedBy: ["Օ"] }`.

## `valueAll`

```typescript
valueAll(
  text: string,
  options: { alphabet: Alphabet },
): {
  decompose: Defined<number>;
  inherit: Defined<number>;
  strict: Defined<number>;
}
```

Runs [`value`](#value) in all three modes. This is the spread `#*`. It does not throw for a missing mode.

```javascript
// #*⟨Հուր⟩ᴬ = { ᵈ 12670 · ⁱ 12070 · ˢ ⊥(Ու) }
valueAll("Հուր", { alphabet: "A" });
// {
//   decompose: { value: 12670, undefinedBy: [] },
//   inherit: { value: 12070, undefinedBy: [] },
//   strict: { value: null, undefinedBy: ["Ու"] },
// }

// #*⟨Հուր⟩ᴳ = { ᵈ 12670 · ⁱ 12670 · ˢ 12670 }
valueAll("Հուր", { alphabet: "G" });
// decompose, inherit, and strict are each { value: 12670, undefinedBy: [] }

// #*⟨Օ⟩ᴳ = { ᵈ ⊥(Օ) · ⁱ ⊥(Օ) · ˢ ⊥(Օ) }
valueAll("Օ", { alphabet: "G" }).decompose;
// { value: null, undefinedBy: ["Օ"] }
```

When tokenization fails, every mode carries that same `undefinedBy`.

## `columnSum`

```typescript
columnSum(
  text: string,
  options: { alphabet: Alphabet; mode?: NumericMode },
): Defined<number>
```

Sums each letter's column digit and stops there. The column is the letter's numeric value with the zeros removed: `Հ` is 7, `Ա` is 1, `Յ` is 3, `Կ` is 6. A mode column such as decompose `Ու` = 13 is added as 13, not reduced to a single digit. The single-digit reduction of this sum is [`reduce`](#reduce) applied to the result, which is `#ₖ₁`.

Mode rules match [`value`](#value).

```javascript
// #ₖ⟨Հայկ⟩ᴳ = 7+1+3+6 = 17
columnSum("Հայկ", { alphabet: "G" });
// { value: 17, undefinedBy: [] }

// #ₖ⟨Արամ⟩ᴳ = 1+5+1+2 = 9
columnSum("Արամ", { alphabet: "G" });
// { value: 9, undefinedBy: [] }

// #ₖ⟨Հուր⟩ᴳ = 7+6+7+5 = 25
columnSum("Հուր", { alphabet: "G" });
// { value: 25, undefinedBy: [] }

// #ₖ⟨ՅՔՀՆ⟩ᴳ = 3+9+7+4 = 23
columnSum("ՅՔՀՆ", { alphabet: "G" });
// { value: 23, undefinedBy: [] }

// #ᵈₖ⟨Հուր⟩ᴬ = 7+13+5 = 25
columnSum("Հուր", { alphabet: "A", mode: "decompose" }).value;
// 25

// #ⁱₖ⟨Հուր⟩ᴬ = 7+7+5 = 19
columnSum("Հուր", { alphabet: "A", mode: "inherit" }).value;
// 19

// #ˢₖ⟨Հուր⟩ᴬ = ⊥(Ու)
columnSum("Հուր", { alphabet: "A", mode: "strict" });
// { value: null, undefinedBy: ["Ու"] }

// #ₖ⟨և⟩ᴳ = 12
columnSum("և", { alphabet: "G" }).value;
// 12     Ե 5 + Ւ 7

// #ᵈₖ⟨և⟩ᴬ = 12
columnSum("և", { alphabet: "A", mode: "decompose" }).value;
// 12
```

`columnSum("Հուր", { alphabet: "A" })` throws.

For `Հայկ`, `reduce(value(...).value)` and `reduce(columnSum(...).value)` are both 8. The column sum 17 is the extra information; its digital root matches the numeric digital root.

## `columnSumAll`

```typescript
columnSumAll(
  text: string,
  options: { alphabet: Alphabet },
): {
  decompose: Defined<number>;
  inherit: Defined<number>;
  strict: Defined<number>;
}
```

Runs [`columnSum`](#columnsum) in all three modes. This is `#*ₖ`.

```javascript
// #*ₖ⟨Հուր⟩ᴬ = { ᵈ 25 · ⁱ 19 · ˢ ⊥(Ու) }
columnSumAll("Հուր", { alphabet: "A" });
// {
//   decompose: { value: 25, undefinedBy: [] },
//   inherit: { value: 19, undefinedBy: [] },
//   strict: { value: null, undefinedBy: ["Ու"] },
// }
```

## `serial`

```typescript
serial(text: string, options: { alphabet: Alphabet }): Defined<number>
```

Sums each letter's position in the chosen alphabet. Positions are 1-based. There is no mode and no column: `Ու` is position 34, `և` is 37, `Օ` is 38, and `Ֆ` is 39, whenever they are letters of that alphabet.

```javascript
// №⟨Հայկ⟩ᴳ = 16+1+21+15 = 53
serial("Հայկ", { alphabet: "G" });
// { value: 53, undefinedBy: [] }

// №⟨Հուր⟩ᴳ = 16+24+34+32 = 106
serial("Հուր", { alphabet: "G" });
// { value: 106, undefinedBy: [] }

// №⟨Հուր⟩ᴬ = 16+34+32 = 82
serial("Հուր", { alphabet: "A" });
// { value: 82, undefinedBy: [] }

// №⟨և⟩ᴬ = 37
serial("և", { alphabet: "A" }).value;
// 37

// №⟨և⟩ᴳ = 5+34 = 39
serial("և", { alphabet: "G" }).value;
// 39

// №⟨օր⟩ᴳ = ⊥(Օ)
serial("օր", { alphabet: "G" });
// { value: null, undefinedBy: ["Օ"] }
```

## `reduce`

```typescript
reduce(n: number): number
```

Digital root. Sum the digits, and repeat until one digit remains. `0` stays `0`. A value that is already one digit stays that digit. This is `#₁` for a numeric total, `#ₖ₁` for a column sum, and `№₁` for a serial total. The function takes the number, so the caller reduces whichever total they computed.

```javascript
// #₁⟨Հայկ⟩ᴳ = 431 ⟶ 8
reduce(431); // 8

// #ₖ₁⟨Հայկ⟩ᴳ = 17 ⟶ 8
reduce(17); // 8

// #₁⟨Հուր⟩ᴳ = 12670 ⟶ 16 ⟶ 7
reduce(12670); // 7

// №₁⟨Հուր⟩ᴳ = 106 ⟶ 7
reduce(106); // 7

// #₁ σ:atbash ⟨Հայկ⟩ᴳ = 9770 ⟶ 23 ⟶ 5
reduce(9770); // 5

reduce(8); // 8
reduce(0); // 0
```

`n` is a non-negative integer. Any other number throws `reduce expects a non-negative integer`.

## More examples

These pair a TirN line with the calls that evaluate it.

```javascript
// #ᵈ⟨լույս⟩ᴬ = 9930
// #⟨լույս⟩ᴳ = 9930
value("լույս", { alphabet: "A", mode: "decompose" }).value; // 9930
value("լույս", { alphabet: "G" }).value;                   // 9930

// #ⁱ⟨լույս⟩ᴬ = 9330
value("լույս", { alphabet: "A", mode: "inherit" }).value; // 9330

// №⟨լույս⟩ᴬ = 96
// №⟨լույս⟩ᴳ = 120
serial("լույս", { alphabet: "A" }).value; // 96
serial("լույս", { alphabet: "G" }).value; // 120

// #ₖ⟨լույս⟩ᴳ = 21
// #ᵈₖ⟨լույս⟩ᴬ = 21
columnSum("լույս", { alphabet: "G" }).value;                    // 21
columnSum("լույս", { alphabet: "A", mode: "decompose" }).value; // 21

// #₁⟨Հայկ⟩ᴳ = #ₖ₁⟨Հայկ⟩ᴳ = 8
reduce(value("Հայկ", { alphabet: "G" }).value);      // 8
reduce(columnSum("Հայկ", { alphabet: "G" }).value);  // 8
```

## Ciphers, acronyms, relations

- [Ciphers](ciphers.md) — `permute`, `σ:atbash`, `σ:+k`, `σ:albam`
- [Acronyms](acronyms.md) — `acronym`, `expand`, `↑`, `↓[dict:name]`
- [Relations](relations.md) — `isAnagram`, `sameValue`, `sameColumnSum`, `sameSerial`, `∼`, `≡#`, `≡#ₖ`, `≡№`


## `derive`

```typescript
derive(
  steps: readonly DerivationStep[],
  options: { format: "unicode" | "ascii" },
): string
```

Prints a numbered derivation. `format` chooses the symbols. Unicode uses `⟨⟩`, `ᴳ`/`ᴬ`, `#₁`, `№`, `⟶`, and `⊥`. ASCII uses `<>`, `G`/`A`, `#1`, `N`, `->`, and `_|_`. The return is the lines joined by `\n`, with no trailing newline.

An `alphabet` step sets the alphabet for the following steps and is not numbered. Every other step is a numbered statement. Numbers in later steps refer to those statement numbers.

```typescript
type DerivationStep =
  | { op: "alphabet"; alphabet: "G" | "A" }
  | { op: "tokenize"; text: string }
  | { op: "value"; line: number; mode?: NumericMode | "*" }
  | { op: "column"; line: number; mode?: NumericMode | "*" }
  | { op: "serial"; line: number }
  | { op: "reduce"; line: number }
  | { op: "cipher"; line: number; cipher: Cipher }
  | { op: "acronym"; text: string }
  | { op: "expand"; text: string; lexicon: Lexicon }
  | { op: "anagram"; left: string; right: string }
  | { op: "same"; by: "value" | "column" | "serial"; left: number; right: number };
```

| Step | Reads | Writes |
|---|---|---|
| `alphabet` | — | A header, `alphabet G` or `alphabet ᴳ`. |
| `tokenize` | `text` | The given word and its letters: `⟨Հուր⟩ᴳ = Հ·Ո·Ւ·Ր`. |
| `value` | a word line | `#` of that word. `mode: "*"` writes the three-mode spread. A single mode is written on the mark, as `#ᵈ` or `#ˢ`. Several letters show the parts: `70+600+7000+5000 = 12670`. |
| `column` | a word line | `#ₖ` of that word. `mode: "*"` writes `#*ₖ`. Justification says `column sum`. |
| `serial` | a word line | `№` of that word, with positions as the parts. |
| `reduce` | a single number line | The digit chain from that number, marked `#₁`, `#ₖ₁`, or `№₁` to match the line it reduced. `12670 ⟶ 16 ⟶ 7`. |
| `cipher` | a word line | The permuted word. Atbash's justification includes the map, `atbash (i ↦ 37−i)`. |
| `acronym` | `text` | `↑⟨…⟩ = ⟨ՀԱՅԿ⟩`. |
| `expand` | `text` and `lexicon` | `↓[dict:name]⟨word⟩ = ⟨phrase⟩`. Several phrases are joined with `·`. None is `∅` in Unicode and `{}` in ASCII. |
| `anagram` | two texts | `∼` when the multisets match, `≁` otherwise. ASCII is `~` and `!~`. |
| `same` | two earlier number lines | `≡#`, `≡#ₖ`, or `≡№` when the amounts are equal, and `≢#`, `≢#ₖ`, or `≢№` when they are not. ASCII uses `=#`, `=#k`, `=N`, and a leading `!` for the unequal forms. Reduced lines take the `₁` / `1` subscript. |

`value`, `column`, `serial`, and `cipher` cite a word line: `tokenize`, `cipher`, or `acronym`. `reduce` cites a `value`, `column`, `serial`, or earlier `reduce` line. A spread is not a single number, so reducing it throws `derivation line N is not a single value`.

`same` between a plain total and a spread reports which modes match. One matching mode is written `under ᵈ only` (ASCII: `under d only`). Two are written `under ᵈ, ⁱ`. All three matching modes omit the `under` clause. The cited lines keep the alphabets they were computed under, so one comparison can show `⟨Հուր⟩ᴳ ≡# ⟨Հուր⟩ᴬ`.

A step before any `alphabet` step throws `derivation has no alphabet`. A line number that is not an earlier statement throws `derivation line N is out of range`. Citing a number from a step that expects a word throws `derivation line N is not a word`. A `same` whose lines are not two comparable totals throws `derivation comparison needs two values`.

`mode: "*"` on `serial` cannot occur; a serial spread throws `a serial value has no spread`. Cipher and mode errors from [`permute`](ciphers.md) and [`value`](#value) surface unchanged, including Ashkharabar `albam` without a variant and a numeric mode required but omitted.

```javascript
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
);
```

```
alphabet G
1. <Հայկ>G = Հ.Ա.Յ.Կ    given; tokenize
2. atbash <Հայկ>G = <ՅՔՀՆ>G    atbash (i -> 37-i), 1
3. #<ՅՔՀՆ>G = 300+9000+70+400 = 9770    #, 2
4. #1<ՅՔՀՆ>G = 9770 -> 23 -> 5    reduce, 3
5. #k<ՅՔՀՆ>G = 3+9+7+4 = 23    column sum, 2
6. shift-1 <Հայկ>G = <ԿՔՄԾ>G    shift-1, 1
```

The same steps with `{ format: "unicode" }` use TirN symbols: `alphabet ᴳ`, `⟨Հայկ⟩ᴳ`, `σ:atbash`, `#₁`, `⟶`, and `σ:−1`.

A block can change alphabet. Spreads and the cross-alphabet comparison look like this:

```javascript
derive(
  [
    { op: "alphabet", alphabet: "G" },
    { op: "tokenize", text: "Հուր" },
    { op: "value", line: 1 },
    { op: "alphabet", alphabet: "A" },
    { op: "tokenize", text: "Հուր" },
    { op: "value", line: 3, mode: "*" },
    { op: "same", by: "value", left: 2, right: 4 },
  ],
  { format: "unicode" },
);
```

```
alphabet ᴳ
1. ⟨Հուր⟩ᴳ = Հ·Ո·Ւ·Ր    given; tokenize
2. #⟨Հուր⟩ᴳ = 70+600+7000+5000 = 12670    #, 1
alphabet ᴬ
3. ⟨Հուր⟩ᴬ = Հ·Ու·Ր    given; tokenize
4. #*⟨Հուր⟩ᴬ = { ᵈ 12670 · ⁱ 12070 · ˢ ⊥(Ու) }    spread, 3
5. ⟨Հուր⟩ᴳ ≡# ⟨Հուր⟩ᴬ under ᵈ only    2, 4
```

Acronym, expansion, and a strict gap:

```javascript
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
);
```

```
alphabet ᴬ
1. ⟨Հուր⟩ᴬ = Հ·Ու·Ր    given; tokenize
2. #ˢ⟨Հուր⟩ᴬ = ⊥(Ու)    #ˢ, 1
3. ↑⟨Ուրախ օր⟩ᴬ = ⟨ՈւՕ⟩ᴬ    acronym
4. ↓[dict:sample]⟨ՀԱՅԿ⟩ᴬ = ⟨Հայոց Այբուբեն Յուրահատուկ Կերտված⟩ᴬ    dict:sample
```
