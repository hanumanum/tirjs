# Acronyms

`acronym` takes the first letter of each word. `expand` finds phrases in a caller-supplied lexicon whose acronym is a given word. Shared rules are in the [function reference](api.md). The notation is [TirN](TIRN.md) §5. tirjs ships no lexicon.

```javascript
import { acronym, expand } from "tirjs";
```

## `acronym`

```typescript
acronym(
  text: string,
  options: { alphabet: "G" | "A" },
): { readonly value: string | null; readonly undefinedBy: readonly string[] }
```

`↑⟨phrase⟩`. The first letter follows tokenization. In Ashkharabar, `Ու` and `և` are one letter, so `Ուրախ` contributes `Ու` and `Եվրոպա` contributes `և`. In Grabar, `Ուրախ` begins with `Ո`. A run of spaces is one word boundary.

If any letter in the text is outside the alphabet, the acronym is undefined. That includes a letter that would not have been chosen as a first letter.

```javascript
// ↑⟨Հայոց Այբուբեն Յուրահատուկ Կերտված⟩ᴬ = ⟨ՀԱՅԿ⟩ᴬ
acronym("Հայոց Այբուբեն Յուրահատուկ Կերտված", { alphabet: "A" });
// { value: "ՀԱՅԿ", undefinedBy: [] }

// ↑⟨Ուրախ օր⟩ᴬ = ⟨ՈւՕ⟩ᴬ
acronym("Ուրախ օր", { alphabet: "A" });
// { value: "ՈւՕ", undefinedBy: [] }

// ↑⟨Ուրախ⟩ᴳ = ⟨Ո⟩ᴳ
acronym("Ուրախ", { alphabet: "G" });
// { value: "Ո", undefinedBy: [] }

// ↑⟨Եվրոպա քաղաք⟩ᴬ = ⟨ևՔ⟩ᴬ
acronym("Եվրոպա քաղաք", { alphabet: "A" }).value;
// "ևՔ"

// ↑⟨հայկ արամ⟩ᴳ = ⟨ՀԱ⟩ᴳ
acronym("  հայկ   արամ  ", { alphabet: "G" }).value;
// "ՀԱ"

// ↑⟨Ուրախ օր⟩ᴳ = ⊥(Օ)
acronym("Ուրախ օր", { alphabet: "G" });
// { value: null, undefinedBy: ["Օ"] }
```

## `expand`

```typescript
expand(
  word: string,
  lexicon: { readonly name: string; readonly phrases: readonly string[] },
  options: { alphabet: "G" | "A" },
): { readonly value: readonly string[] | null; readonly undefinedBy: readonly string[] }
```

`↓[dict:name]⟨word⟩`. A phrase is returned when its acronym equals the letters of `word`. Matching uses canonical letters, so `հայկ` and `ՀԱՅԿ` find the same phrases. Results keep the lexicon's order. The lexicon object is left unchanged. `name` is the dictionary a derivation cites.

A phrase that does not tokenize in this alphabet is skipped. A word that does not tokenize makes the call undefined. No matching phrase is an empty list, written `∅` in the notation.

```javascript
const lexicon = {
  name: "sample",
  phrases: [
    "այլ բան",
    "Հայոց Այբուբեն Յուրահատուկ Կերտված",
    "հայր արքա յոյն կին",
  ],
};

// ↓[dict:sample]⟨հայկ⟩ᴬ = ⟨Հայոց Այբուբեն Յուրահատուկ Կերտված⟩ · ⟨հայր արքա յոյն կին⟩
expand("հայկ", lexicon, { alphabet: "A" });
// {
//   value: [
//     "Հայոց Այբուբեն Յուրահատուկ Կերտված",
//     "հայր արքա յոյն կին",
//   ],
//   undefinedBy: [],
// }

// ↓[dict:sample]⟨ՀԱՅ⟩ᴬ = ∅
expand("ՀԱՅ", lexicon, { alphabet: "A" });
// { value: [], undefinedBy: [] }

// ↓[dict:sample]⟨Օ⟩ᴳ = ⊥(Օ)
expand("Օ", lexicon, { alphabet: "G" });
// { value: null, undefinedBy: ["Օ"] }
```

## More examples

One phrase, two alphabets. `Եվրոպական` begins with `և` in Ashkharabar and with `Ե` in Grabar. `Ուրախ` begins with `Ու` or with `Ո`.

```javascript
// ↑⟨գրաբար լեզու⟩ᴬ = ⟨ԳԼ⟩ᴬ
// ↑⟨գրաբար լեզու⟩ᴳ = ⟨ԳԼ⟩ᴳ
acronym("գրաբար լեզու", { alphabet: "A" }).value; // "ԳԼ"
acronym("գրաբար լեզու", { alphabet: "G" }).value; // "ԳԼ"

// ↑⟨Եվրոպական միություն⟩ᴬ = ⟨ևՄ⟩ᴬ
acronym("Եվրոպական միություն", { alphabet: "A" }).value;
// "ևՄ"

// ↑⟨Եվրոպական միություն⟩ᴳ = ⟨ԵՄ⟩ᴳ
acronym("Եվրոպական միություն", { alphabet: "G" }).value;
// "ԵՄ"

// ↑⟨Ուրախ առավոտ⟩ᴬ = ⟨ՈւԱ⟩ᴬ
acronym("Ուրախ առավոտ", { alphabet: "A" }).value;
// "ՈւԱ"

// ↑⟨Ուրախ առավոտ⟩ᴳ = ⟨ՈԱ⟩ᴳ
acronym("Ուրախ առավոտ", { alphabet: "G" }).value;
// "ՈԱ"

// ↑⟨սուրբ գրոց⟩ᴬ = ⟨ՍԳ⟩ᴬ
// ↑⟨սուրբ գրոց⟩ᴳ = ⟨ՍԳ⟩ᴳ
acronym("սուրբ գրոց", { alphabet: "A" }).value; // "ՍԳ"
acronym("սուրբ գրոց", { alphabet: "G" }).value; // "ՍԳ"

// ↑⟨և նոր օր⟩ᴬ = ⟨ևՆՕ⟩ᴬ
acronym("և նոր օր", { alphabet: "A" }).value;
// "ևՆՕ"

// ↑⟨և նոր օր⟩ᴳ = ⊥(Օ)
acronym("և նոր օր", { alphabet: "G" });
// { value: null, undefinedBy: ["Օ"] }
```

Expansion uses those acronyms as the query. The Grabar query `ԵՄ` still finds `Եվրոպական միություն`, because in Grabar that phrase acronyms to `ԵՄ`. The query `ՕՆ` is a defined Ashkharabar word and an undefined Grabar word.

```javascript
const pages = {
  name: "sample",
  phrases: [
    "Հայոց Այբուբեն Յուրահատուկ Կերտված",
    "օր նոր",
    "Եվրոպական միություն",
    "գրաբար լեզու",
  ],
};

// ↓[dict:sample]⟨ևՄ⟩ᴬ = ⟨Եվրոպական միություն⟩ᴬ
expand("ևՄ", pages, { alphabet: "A" });
// { value: ["Եվրոպական միություն"], undefinedBy: [] }

// ↓[dict:sample]⟨ԵՄ⟩ᴳ = ⟨Եվրոպական միություն⟩ᴳ
expand("ԵՄ", pages, { alphabet: "G" });
// { value: ["Եվրոպական միություն"], undefinedBy: [] }

// ↓[dict:sample]⟨գլ⟩ᴬ = ⟨գրաբար լեզու⟩ᴬ
expand("գլ", pages, { alphabet: "A" });
// { value: ["գրաբար լեզու"], undefinedBy: [] }

// ↓[dict:sample]⟨ԳԼ⟩ᴳ = ⟨գրաբար լեզու⟩ᴳ
expand("ԳԼ", pages, { alphabet: "G" });
// { value: ["գրաբար լեզու"], undefinedBy: [] }

// ↓[dict:sample]⟨ՕՆ⟩ᴬ = ⟨օր նոր⟩ᴬ
expand("ՕՆ", pages, { alphabet: "A" });
// { value: ["օր նոր"], undefinedBy: [] }

// ↓[dict:sample]⟨ՕՆ⟩ᴳ = ⊥(Օ)
expand("ՕՆ", pages, { alphabet: "G" });
// { value: null, undefinedBy: ["Օ"] }
```

Acronym and expansion meet on the same phrase.

```javascript
// ↑⟨Եվրոպական միություն⟩ᴬ = ⟨ևՄ⟩ᴬ
// ↓[dict:sample]⟨ևՄ⟩ᴬ = ⟨Եվրոպական միություն⟩ᴬ
const word = acronym("Եվրոպական միություն", { alphabet: "A" }).value;
expand(word, pages, { alphabet: "A" }).value;
// ["Եվրոպական միություն"]
```
