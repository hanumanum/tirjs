# tirjs

Functional library for [TirN](docs/TIRN.md), a notation for Armenian letter–number operations. The alphabet is always Grabar (`"G"`, 36 letters) or Ashkharabar (`"A"`, 39 letters). Plain JavaScript can call it with `import` or `require`.

The [function reference](docs/api.md) specifies every TirN call. [Ciphers](docs/ciphers.md), [acronyms](docs/acronyms.md), and [relations](docs/relations.md) continue it, with a TirN line above each example. The short samples below are the ones used most often.

## Install

```bash
npm install tirjs
```

## Values

A result that can be undefined is `{ value, undefinedBy }`. `undefinedBy` names the letters that made it undefined. It is empty when `value` is defined.

```javascript
import { columnSum, letters, reduce, serial, value, valueAll } from "tirjs";

// ⟨Հուր⟩ᴳ = Հ·Ո·Ւ·Ր
letters("Հուր", { alphabet: "G" });
// { value: ["Հ", "Ո", "Ւ", "Ր"], undefinedBy: [] }

// #⟨Հայկ⟩ᴳ = 431
value("Հայկ", { alphabet: "G" });
// { value: 431, undefinedBy: [] }

// #₁⟨Հայկ⟩ᴳ = 8
reduce(431);
// 8

// №⟨Հուր⟩ᴬ = 82
serial("Հուր", { alphabet: "A" });
// { value: 82, undefinedBy: [] }

// #ᵈ⟨Հուր⟩ᴬ = 12670
value("Հուր", { alphabet: "A", mode: "decompose" });
// { value: 12670, undefinedBy: [] }

// #*⟨Հուր⟩ᴬ = { ᵈ 12670 · ⁱ 12070 · ˢ ⊥(Ու) }
valueAll("Հուր", { alphabet: "A" });

// #ₖ⟨Հայկ⟩ᴳ = 17
columnSum("Հայկ", { alphabet: "G" });
// { value: 17, undefinedBy: [] }
```

Ու, և, Օ, and Ֆ have no single classic numeric value. Pass `mode: "decompose"`, `"inherit"`, or `"strict"`. `valueAll` and `columnSumAll` return all three. In Grabar the three modes agree.

## Ciphers, acronyms, relations

```javascript
import { acronym, expand, isAnagram, permute } from "tirjs";

// σ:atbash ⟨Հայկ⟩ᴳ = ⟨ՅՔՀՆ⟩ᴳ
permute("Հայկ", "atbash", { alphabet: "G" });
// { value: "ՅՔՀՆ", letters: [["Յ", "Ք", "Հ", "Ն"]], undefinedBy: [] }

// σ:+1 ⟨Ա⟩ᴳ = ⟨Բ⟩ᴳ
permute("Ա", { shift: 1 }, { alphabet: "G" });
// { value: "Բ", letters: [["Բ"]], undefinedBy: [] }

// ↑⟨Ուրախ օր⟩ᴬ = ⟨ՈւՕ⟩ᴬ
acronym("Ուրախ օր", { alphabet: "A" });
// { value: "ՈւՕ", undefinedBy: [] }

// ↓[dict:sample]⟨ՀԱՅԿ⟩ᴬ = ⟨Հայոց Այբուբեն Յուրահատուկ Կերտված⟩ᴬ
expand("ՀԱՅԿ", {
  name: "sample",
  phrases: ["Հայոց Այբուբեն Յուրահատուկ Կերտված"],
}, { alphabet: "A" });

// ⟨եւ⟩ᴬ ∼ ⟨եվ⟩ᴬ
isAnagram("եւ", "եվ", { alphabet: "A" });
// { value: true, undefinedBy: [] }
```

`permute` also takes `"albam.pivot"` and `"albam.shift"`. On Grabar, `"albam"` is the same half-swap. Ashkharabar albam takes one of the two variants. The result includes `letters`, the words after the permutation. Pass that result to the next call so those letters are kept. Passing `.value` tokenizes the string again. `expand` searches a lexicon the caller supplies. tirjs ships none.

`sameValue`, `sameColumnSum`, and `sameSerial` compare two texts under one alphabet: `≡#`, `≡#ₖ`, and `≡№`.

## Derivations

`derive` prints a numbered derivation. The caller chooses `"unicode"` or `"ascii"`.

```javascript
import { derive } from "tirjs";

derive(
  [
    { op: "alphabet", alphabet: "G" },
    { op: "tokenize", text: "Հայկ" },
    { op: "cipher", line: 1, cipher: "atbash" },
    { op: "value", line: 2 },
    { op: "reduce", line: 3 },
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
```

## Result

`Result` is a plain object, `{ ok: true, value }` or `{ ok: false, error }`. `pipe` threads a value through small functions.

```typescript
import { err, ok, unwrapOr, type Result } from "tirjs";

const lengthOf = (text: string): Result<number, "empty"> =>
  text.length === 0 ? err("empty") : ok(text.length);

unwrapOr(lengthOf("abcd"), 0);
```

## Develop

```bash
npm install
npm install --prefix examples/javascript-esm
npm install --prefix examples/javascript-cjs
npm test
npm run check
```

`npm test` runs one Vitest file per module in `src/`. `npm run check` also typechecks, builds ESM and CommonJS into `dist/`, and runs the plain JavaScript examples.

Add behavior test-first. Write the module test beside the module, run `npm test` and see the new test fail, then add the module and export it from `src/index.ts`. Put functional helpers in `src/utils/fp/`. Each iteration ends with `npm test` passing, and with `README.md` plus the other docs updated to match the change.

## Layout

```
src/index.ts         Public exports
src/ciphers/         Alphabet permutations (atbash, shift, albam)
src/acronyms/        Acronym and lexicon expansion
src/relations/       Anagram and equal-value comparisons
src/utils/fp/        Functional helpers (pipe, result) and their module tests
knowledge/           Letter tables, one JSON file per table
examples/            Plain JavaScript clients
docs/TIRN.md         TirN notation
docs/api.md          Letters, values, reduction, derivations
docs/ciphers.md      permute
docs/acronyms.md     acronym and expand
docs/relations.md    anagram and equal-value comparisons
dist/                ESM, CommonJS, and .d.ts (build output)
.cursor/rules/       Project rules: functional style, JavaScript clients, module tests, test-first work, and the iteration close
```
