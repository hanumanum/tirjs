# Ciphers

`permute` applies one alphabet permutation, letter by letter. Shared rules for alphabets, case, and `⊥` are in the [function reference](api.md). The notation is [TirN](TIRN.md) §4.

```javascript
import { columnSum, permute, reduce, serial, value } from "tirjs";
```

```typescript
type Cipher =
  | "atbash"
  | "albam"
  | "albam.pivot"
  | "albam.shift"
  | { readonly shift: number };

type Spelling = {
  readonly value: string | null;
  readonly letters: readonly (readonly string[])[] | null;
  readonly undefinedBy: readonly string[];
};

permute(
  text: string | Spelling,
  cipher: Cipher,
  options: { alphabet: "G" | "A" },
): Spelling
```

Words stay separate and come back in canonical spelling. `letters` is one array per word. `value` writes those letters with one space between words. A shift of zero still rewrites `Հայկ` as `ՀԱՅԿ`. A text that does not tokenize returns `{ value: null, letters: null, undefinedBy }`.

Pass the whole result to the next call: `value`, `serial`, `columnSum`, another `permute`, or a relation. That call reads `letters`. Passing `result.value` tokenizes the string, and Ashkharabar then reads `ԵՎ` as the one letter `և`.

| Cipher | TirN | Rule |
|---|---|---|
| `"atbash"` | `σ:atbash` | Position `i` becomes `size + 1 − i`. Grabar uses 37−i. Ashkharabar uses 40−i. |
| `{ shift: k }` | `σ:+k`, `σ:−k` | Position `i` becomes `((i − 1 + k) mod size) + 1`. `k` is any integer. |
| `"albam"`, `"albam.pivot"`, `"albam.shift"` on Grabar | `σ:albam`, `σ:albamᵖ`, `σ:albamˢ` | Shift by 18. All three names are that half-swap, and applying one twice restores the canonical word. |
| `"albam.pivot"` on Ashkharabar | `σ:albamᵖ` | Positions 1–19 swap with 21–39. Position 20, `Մ`, stays. Applying it twice restores the canonical word. |
| `"albam.shift"` on Ashkharabar | `σ:albamˢ` | Shift by 19. Applying it twice is a different word. |
| `"albam"` on Ashkharabar | — | Throws `Ashkharabar albam needs a variant: albam.pivot or albam.shift`. |

A non-integer `shift` throws `shift expects an integer`. An unknown cipher name throws `unknown cipher`.

```javascript
// σ:atbash ⟨Հայկ⟩ᴳ = ⟨ՅՔՀՆ⟩ᴳ
permute("Հայկ", "atbash", { alphabet: "G" });
// { value: "ՅՔՀՆ", letters: [["Յ", "Ք", "Հ", "Ն"]], undefinedBy: [] }

// σ:atbash ⟨հայկ⟩ᴬ = ⟨ՈՖՃՉ⟩ᴬ
permute("հայկ", "atbash", { alphabet: "A" });
// { value: "ՈՖՃՉ", letters: [["Ո", "Ֆ", "Ճ", "Չ"]], undefinedBy: [] }

// σ:atbash ⟨Հուր⟩ᴳ = ⟨ՅԽԳԵ⟩ᴳ
permute("Հուր", "atbash", { alphabet: "G" }).value;
// "ՅԽԳԵ"

// σ:atbash ⟨Հուր⟩ᴬ = ⟨ՈԶԸ⟩ᴬ
permute("Հուր", "atbash", { alphabet: "A" }).value;
// "ՈԶԸ"

// σ:+1 ⟨Ա⟩ᴳ = ⟨Բ⟩ᴳ
permute("Ա", { shift: 1 }, { alphabet: "G" }).value;
// "Բ"

// σ:−1 ⟨Ա⟩ᴳ = ⟨Ք⟩ᴳ
permute("Ա", { shift: -1 }, { alphabet: "G" }).value;
// "Ք"

// σ:+36 ⟨Ա⟩ᴳ = ⟨Ա⟩ᴳ
permute("Ա", { shift: 36 }, { alphabet: "G" }).value;
// "Ա"

// σ:+0 ⟨Հայկ Հուր⟩ᴳ = ⟨ՀԱՅԿ ՀՈՒՐ⟩ᴳ
permute("Հայկ Հուր", { shift: 0 }, { alphabet: "G" }).value;
// "ՀԱՅԿ ՀՈՒՐ"

// σ:albam ⟨Ա⟩ᴳ = ⟨Ճ⟩ᴳ
permute("Ա", "albam", { alphabet: "G" }).value;
// "Ճ"

// σ:albamᵖ ⟨Ա⟩ᴬ = ⟨Յ⟩ᴬ
permute("Ա", "albam.pivot", { alphabet: "A" }).value;
// "Յ"

// σ:albamᵖ ⟨Մ⟩ᴬ = ⟨Մ⟩ᴬ
permute("Մ", "albam.pivot", { alphabet: "A" }).value;
// "Մ"

// σ:albamˢ ⟨Ա⟩ᴬ = ⟨Մ⟩ᴬ
permute("Ա", "albam.shift", { alphabet: "A" }).value;
// "Մ"

// σ:albamˢ ⟨Մ⟩ᴬ = ⟨Ֆ⟩ᴬ
permute("Մ", "albam.shift", { alphabet: "A" }).value;
// "Ֆ"

// σ:atbash ⟨Օ⟩ᴳ = ⊥(Օ)
permute("Օ", "atbash", { alphabet: "G" });
// { value: null, letters: null, undefinedBy: ["Օ"] }
```

Atbash of atbash, Grabar albam of Grabar albam, and Ashkharabar `albam.pivot` of itself each return the canonical original. `albam.shift` on Ashkharabar does not: `Ա` goes to `Մ`, and `Մ` goes on to `Ֆ`.

A cipher changes the letters. The number of the new word is a separate call:

```javascript
// #₁ σ:atbash ⟨Հայկ⟩ᴳ = 5
// #ₖ σ:atbash ⟨Հայկ⟩ᴳ = 23
const image = permute("Հայկ", "atbash", { alphabet: "G" });
value(image, { alphabet: "G" }).value;       // 9770
reduce(9770);                                 // 5
columnSum(image, { alphabet: "G" }).value;   // 23
```

## More examples

The same spelling is a different letter sequence in each alphabet, so the cipher image changes with it.

```javascript
// ⟨լույս⟩ᴬ = Լ·Ու·Յ·Ս
// σ:atbash ⟨լույս⟩ᴬ = ⟨ՌԶՃԻ⟩ᴬ
permute("լույս", "atbash", { alphabet: "A" }).value;
// "ՌԶՃԻ"

// ⟨լույս⟩ᴳ = Լ·Ո·Ւ·Յ·Ս
// σ:atbash ⟨լույս⟩ᴳ = ⟨ՉԽԳՀԸ⟩ᴳ
permute("լույս", "atbash", { alphabet: "G" }).value;
// "ՉԽԳՀԸ"

// ⟨լոյս⟩ᴳ = Լ·Ո·Յ·Ս
// σ:atbash ⟨լոյս⟩ᴳ = ⟨ՉԽՀԸ⟩ᴳ
permute("լոյս", "atbash", { alphabet: "G" }).value;
// "ՉԽՀԸ"
```

`ու` is two Grabar letters and one Ashkharabar letter.

```javascript
// σ:atbash ⟨ու⟩ᴳ = ⟨ԽԳ⟩ᴳ
permute("ու", "atbash", { alphabet: "G" }).value;
// "ԽԳ"

// σ:atbash ⟨ու⟩ᴬ = ⟨Զ⟩ᴬ
permute("ու", "atbash", { alphabet: "A" }).value;
// "Զ"

// σ:atbash ⟨եւ⟩ᴬ = ⟨Գ⟩ᴬ
// σ:atbash ⟨եվ⟩ᴬ = ⟨Գ⟩ᴬ
permute("եւ", "atbash", { alphabet: "A" }).value;
// "Գ"
permute("եվ", "atbash", { alphabet: "A" }).value;
// "Գ"

// σ:atbash ⟨եւ⟩ᴳ = ⟨ՐԳ⟩ᴳ
// σ:atbash ⟨եվ⟩ᴳ = ⟨ՐԷ⟩ᴳ
permute("եւ", "atbash", { alphabet: "G" }).value;
// "ՐԳ"
permute("եվ", "atbash", { alphabet: "G" }).value;
// "ՐԷ"
```

`Եվրոպա` starts with `և` in Ashkharabar and with `Ե` in Grabar.

```javascript
// σ:atbash ⟨Եվրոպա⟩ᴬ = ⟨ԳԸՀԾՖ⟩ᴬ
permute("Եվրոպա", "atbash", { alphabet: "A" }).value;
// "ԳԸՀԾՖ"

// σ:atbash ⟨Եվրոպա⟩ᴳ = ⟨ՐԷԵԽԻՔ⟩ᴳ
permute("Եվրոպա", "atbash", { alphabet: "G" }).value;
// "ՐԷԵԽԻՔ"
```

A phrase keeps its word boundary. One space in the result replaces any run of spaces in the input.

```javascript
// σ:+1 ⟨Հայոց աշխարհ⟩ᴬ = ⟨ՁԲՆՉՈւ ԲՈԾԲՑՁ⟩ᴬ
permute("Հայոց աշխարհ", { shift: 1 }, { alphabet: "A" }).value;
// "ՁԲՆՉՈւ ԲՈԾԲՑՁ"

// σ:atbash ⟨Հայոց աշխարհ⟩ᴳ = ⟨ՅՔՀԽԴ ՔԾՈՔԵՅ⟩ᴳ
permute("Հայոց աշխարհ", "atbash", { alphabet: "G" }).value;
// "ՅՔՀԽԴ ՔԾՈՔԵՅ"
```

Albam on a whole word, then the self-inverse check.

```javascript
// σ:albam ⟨Հայկ⟩ᴳ = ⟨ՒՃԳՑ⟩ᴳ
permute("Հայկ", "albam", { alphabet: "G" }).value;
// "ՒՃԳՑ"

// σ:albam ⟨ՒՃԳՑ⟩ᴳ = ⟨ՀԱՅԿ⟩ᴳ
permute("ՒՃԳՑ", "albam.pivot", { alphabet: "G" }).value;
// "ՀԱՅԿ"

// σ:albamᵖ ⟨Հայկ⟩ᴬ = ⟨ՔՅԱՓ⟩ᴬ
permute("Հայկ", "albam.pivot", { alphabet: "A" }).value;
// "ՔՅԱՓ"

// σ:albamᵖ ⟨ՔՅԱՓ⟩ᴬ = ⟨ՀԱՅԿ⟩ᴬ
permute("ՔՅԱՓ", "albam.pivot", { alphabet: "A" }).value;
// "ՀԱՅԿ"

// σ:albamˢ ⟨Հայկ⟩ᴬ = ⟨ՓՄԱՈւ⟩ᴬ
permute("Հայկ", "albam.shift", { alphabet: "A" }).value;
// "ՓՄԱՈւ"

// σ:albamˢ σ:albamˢ ⟨Ա⟩ᴬ = ⟨Ֆ⟩ᴬ
permute(permute("Ա", "albam.shift", { alphabet: "A" }).value, "albam.shift", { alphabet: "A" }).value;
// "Ֆ"

// σ:atbash σ:atbash ⟨հայկ⟩ᴳ = ⟨ՀԱՅԿ⟩ᴳ
permute(permute("հայկ", "atbash", { alphabet: "G" }), "atbash", { alphabet: "G" }).value;
// "ՀԱՅԿ"
```

Atbash of `ՓԺ` in Ashkharabar is the two letters `Ե` and `Վ`. The string `ԵՎ` would be read back as `և`. The letter list keeps them apart, so the serial is `5+30` and atbash applied to that result returns `ՓԺ`.

```javascript
// σ:atbash ⟨ՓԺ⟩ᴬ = ⟨ԵՎ⟩ᴬ    letters Ե·Վ
const split = permute("ՓԺ", "atbash", { alphabet: "A" });
// { value: "ԵՎ", letters: [["Ե", "Վ"]], undefinedBy: [] }

// №⟨Ե·Վ⟩ᴬ = 5+30 = 35
serial(split, { alphabet: "A" }).value;
// 35

// #⟨Ե·Վ⟩ᴬ = 5+3000 = 3005
value(split, { alphabet: "A" }).value;
// 3005

// σ:atbash ⟨Ե·Վ⟩ᴬ = ⟨ՓԺ⟩ᴬ
permute(split, "atbash", { alphabet: "A" }).value;
// "ՓԺ"
```
