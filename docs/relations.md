# Relations

Four comparisons of two texts under one alphabet. Shared rules, including when a numeric mode is required, are in the [function reference](api.md). The notation is [TirN](TIRN.md) §6.

An anagram compares letters. A cipher permutes the alphabet. The two have different symbols, `∼` and `σ`.

```javascript
import { isAnagram, sameColumnSum, sameSerial, sameValue } from "tirjs";
```

A true comparison returns `{ value: true, undefinedBy: [] }`. A false one returns `{ value: false, undefinedBy: [] }`. If either text is undefined, the relation is undefined: causes from the left text come first, then any new causes from the right.

## `isAnagram`

```typescript
isAnagram(
  left: string,
  right: string,
  options: { alphabet: "G" | "A" },
): { readonly value: boolean | null; readonly undefinedBy: readonly string[] }
```

`⟨a⟩ ∼ ⟨b⟩` when both texts have the same letters with the same counts after tokenization. Order does not matter. Spaces do not count as letters.

```javascript
// ⟨Հայկ⟩ᴳ ∼ ⟨կայՀ⟩ᴳ
isAnagram("Հայկ", "կայՀ", { alphabet: "G" });
// { value: true, undefinedBy: [] }

// ⟨Հայկ⟩ᴳ ≁ ⟨Հայ⟩ᴳ
isAnagram("Հայկ", "Հայ", { alphabet: "G" }).value;
// false

// ⟨եւ⟩ᴬ ∼ ⟨եվ⟩ᴬ
isAnagram("եւ", "եվ", { alphabet: "A" }).value;
// true

// ⟨եւ⟩ᴳ ≁ ⟨եվ⟩ᴳ
isAnagram("եւ", "եվ", { alphabet: "G" }).value;
// false

// ⟨ու⟩ᴳ ∼ ⟨ՈՒ⟩ᴳ
isAnagram("ու", "ՈՒ", { alphabet: "G" }).value;
// true

// ⟨ու⟩ᴬ ∼ ⟨ՈՒ⟩ᴬ
isAnagram("ու", "ՈՒ", { alphabet: "A" }).value;
// true

// ⟨Օ⟩ᴳ ∼ ⟨Ֆ⟩ᴳ = ⊥(Օ, Ֆ)
isAnagram("Օ", "Ֆ", { alphabet: "G" });
// { value: null, undefinedBy: ["Օ", "Ֆ"] }
```

In Ashkharabar, `եւ` and `եվ` are both the letter `և`. In Grabar they are `Ե·Ւ` and `Ե·Վ`. `ու` and `ՈՒ` match inside either alphabet: two letters in Grabar, one letter in Ashkharabar.

## `sameValue`

```typescript
sameValue(
  left: string,
  right: string,
  options: { alphabet: "G" | "A"; mode?: "decompose" | "inherit" | "strict" },
): { readonly value: boolean | null; readonly undefinedBy: readonly string[] }
```

`⟨a⟩ ≡# ⟨b⟩` when [`value`](api.md#value) of both texts is the same number. Both texts share the alphabet and the mode. Write the mode on the sign when it is part of the call: `≡#ᵈ`, `≡#ⁱ`, `≡#ˢ`. The mode rules of `value` apply, including the throw when an Ashkharabar text needs a mode and none was passed.

```javascript
// ⟨Հայկ⟩ᴳ ≡# ⟨հայկ⟩ᴳ
sameValue("Հայկ", "հայկ", { alphabet: "G" });
// { value: true, undefinedBy: [] }

// ⟨Ա⟩ᴳ ≢# ⟨Բ⟩ᴳ
sameValue("Ա", "Բ", { alphabet: "G" }).value;
// false

// ⟨Հուր⟩ᴬ ≡#ᵈ ⟨Հուր⟩ᴬ
sameValue("Հուր", "Հուր", { alphabet: "A", mode: "decompose" }).value;
// true

// ⟨Հուր⟩ᴬ ≡#ˢ ⟨Հուր⟩ᴬ = ⊥(Ու)
sameValue("Հուր", "Հուր", { alphabet: "A", mode: "strict" });
// { value: null, undefinedBy: ["Ու"] }
```

Two alphabets are compared by calling `value` once for each, or by a [`derive`](api.md#derive) block that changes alphabet between lines. Under decompose, `#⟨լույս⟩ᴳ` and `#ᵈ⟨լույս⟩ᴬ` are both 9930.

## `sameColumnSum`

```typescript
sameColumnSum(
  left: string,
  right: string,
  options: { alphabet: "G" | "A"; mode?: "decompose" | "inherit" | "strict" },
): { readonly value: boolean | null; readonly undefinedBy: readonly string[] }
```

`⟨a⟩ ≡#ₖ ⟨b⟩` when [`columnSum`](api.md#columnsum) of both texts is the same number. Same options and same undefined-handling as `sameValue`.

```javascript
// ⟨Արամ⟩ᴳ ≡#ₖ ⟨Ք⟩ᴳ
sameColumnSum("Արամ", "Ք", { alphabet: "G" });
// { value: true, undefinedBy: [] }

// ⟨Հուր⟩ᴬ ≡#ₖ ⟨Հուր⟩ᴬ throws: the mode is required
sameColumnSum("Հուր", "Հուր", { alphabet: "A" });
```

`Արամ` has column sum 9, and so does `Ք`.

## `sameSerial`

```typescript
sameSerial(
  left: string,
  right: string,
  options: { alphabet: "G" | "A" },
): { readonly value: boolean | null; readonly undefinedBy: readonly string[] }
```

`⟨a⟩ ≡№ ⟨b⟩` when [`serial`](api.md#serial) of both texts is the same number. There is no mode.

```javascript
// ⟨Հուր⟩ᴬ ≡№ ⟨Հուր⟩ᴬ
sameSerial("Հուր", "Հուր", { alphabet: "A" });
// { value: true, undefinedBy: [] }

// ⟨Ա⟩ᴳ ≢№ ⟨Բ⟩ᴳ
sameSerial("Ա", "Բ", { alphabet: "G" }).value;
// false
```

## More examples

An anagram follows the alphabet's letters, including counts. A space is not a letter.

```javascript
// ⟨լույս⟩ᴬ ∼ ⟨սուլյ⟩ᴬ
// ⟨լույս⟩ᴳ ∼ ⟨սուլյ⟩ᴳ
isAnagram("լույս", "սուլյ", { alphabet: "A" }).value; // true
isAnagram("լույս", "սուլյ", { alphabet: "G" }).value; // true

// ⟨լույս⟩ᴬ ≁ ⟨լոյս⟩ᴬ
isAnagram("լույս", "լոյս", { alphabet: "A" }).value;
// false

// ⟨ուր⟩ᴬ ∼ ⟨րու⟩ᴬ
// ⟨ուր⟩ᴳ ∼ ⟨րու⟩ᴳ
isAnagram("ուր", "րու", { alphabet: "A" }).value; // true
isAnagram("ուր", "րու", { alphabet: "G" }).value; // true

// ⟨եւրոպա⟩ᴬ ∼ ⟨Եվրոպա⟩ᴬ
isAnagram("եւրոպա", "Եվրոպա", { alphabet: "A" }).value;
// true

// ⟨եւրոպա⟩ᴳ ≁ ⟨Եվրոպա⟩ᴳ
isAnagram("եւրոպա", "Եվրոպա", { alphabet: "G" }).value;
// false

// ⟨եվ⟩ᴬ ∼ ⟨և⟩ᴬ
isAnagram("եվ", "և", { alphabet: "A" }).value;
// true

// ⟨եվ⟩ᴳ ≁ ⟨և⟩ᴳ
isAnagram("եվ", "և", { alphabet: "G" }).value;
// false

// ⟨Հայ կ⟩ᴳ ∼ ⟨կայՀ⟩ᴳ
isAnagram("Հայ կ", "կայՀ", { alphabet: "G" }).value;
// true

// ⟨Հայկ⟩ᴳ ≁ ⟨Հայկկ⟩ᴳ
isAnagram("Հայկ", "Հայկկ", { alphabet: "G" }).value;
// false
```

Equal column sum and equal numeric value are different relations. `Լ` and `Յ` share column 3. Their numeric values are 30 and 300.

```javascript
// ⟨Լ⟩ᴳ ≡#ₖ ⟨Յ⟩ᴳ
sameColumnSum("Լ", "Յ", { alphabet: "G" }).value;
// true

// ⟨Լ⟩ᴳ ≢# ⟨Յ⟩ᴳ
sameValue("Լ", "Յ", { alphabet: "G" }).value;
// false

// ⟨Արամ⟩ᴳ ≡#ₖ ⟨Թ⟩ᴳ
sameColumnSum("Արամ", "Թ", { alphabet: "G" }).value;
// true
```

`աբ` is `Ա+Բ`, numeric 1+2 and serial 1+2. `Գ` is the letter whose number and position are both 3.

```javascript
// ⟨աբ⟩ᴳ ≡# ⟨Գ⟩ᴳ
sameValue("աբ", "Գ", { alphabet: "G" }).value;
// true

// ⟨աբ⟩ᴳ ≡№ ⟨Գ⟩ᴳ
sameSerial("աբ", "Գ", { alphabet: "G" }).value;
// true
```

`օր` under decompose or inherit is `0 + 5000`, the same number as `Ր`. Strict mode names `Օ`.

```javascript
// ⟨Ր⟩ᴬ ≡#ᵈ ⟨օր⟩ᴬ
sameValue("Ր", "օր", { alphabet: "A", mode: "decompose" }).value;
// true

// ⟨Ր⟩ᴬ ≡#ⁱ ⟨օր⟩ᴬ
sameValue("Ր", "օր", { alphabet: "A", mode: "inherit" }).value;
// true

// ⟨Ր⟩ᴬ ≡#ˢ ⟨օր⟩ᴬ = ⊥(Օ)
sameValue("Ր", "օր", { alphabet: "A", mode: "strict" });
// { value: null, undefinedBy: ["Օ"] }
```
