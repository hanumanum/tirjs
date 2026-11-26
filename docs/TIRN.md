# TirN — Tir Notation

**A formal notation for Armenian letter–number operations**
Reference specification for the `tirjs` library · Draft 0.2

> Named after Tir (Տիր), the Armenian god of writing, wisdom and scribes.

---

## 0. Principles

1. **Armenian only.** TirN covers the Mashtots alphabet and nothing else. No Hebrew, Greek, Indian or other systems.
2. **No privileged interpretation.** Wherever a choice is interpretive (alphabet, numeric mode, reduction method, cipher variant), every option is available and none is a hidden default. Meaning and the best option, if there is one, come from experimentation and reflection on the results, not from the library.
3. **Every derivation is reproducible.** Every choice is written in the notation, so a derivation on paper can be checked by hand or replayed in code.
4. **Paper first, code second.** Every symbol has a handwritten/Unicode form and an ASCII form, and maps 1:1 to a `tirjs` function.
5. **No lexicon inside.** tirjs ships no word lists or dictionaries. Anything that needs one receives it from client code.

---

## 1. Alphabets

Two alphabets are supported. The alphabet decides only **how text is split into letters** and **what each letter is worth**. It does not change spelling: Grabar text keeps classical orthography (`լոյս`), and Ashkharabar text keeps reformed orthography (`լույս`).

| Mark | ASCII | Name | Letters |
|---|---|---|---|
| ᴳ | `G` | Grabar (գրաբար) | 36 |
| ᴬ | `A` | Ashkharabar (աշխարհաբար) | 39 |

If no alphabet is written, the derivation is incomplete. Always write ᴳ or ᴬ.

### 1.1 Letter table

Positions 1–33 are the same in both alphabets. *Column* is the letter's single digit (§3.3).

| № | Grabar ᴳ | Ashkharabar ᴬ | # (numeric) | Column |
|---:|:---:|:---:|---:|:---:|
| 1 | Ա | Ա | 1 | 1 |
| 2 | Բ | Բ | 2 | 2 |
| 3 | Գ | Գ | 3 | 3 |
| 4 | Դ | Դ | 4 | 4 |
| 5 | Ե | Ե | 5 | 5 |
| 6 | Զ | Զ | 6 | 6 |
| 7 | Է | Է | 7 | 7 |
| 8 | Ը | Ը | 8 | 8 |
| 9 | Թ | Թ | 9 | 9 |
| 10 | Ժ | Ժ | 10 | 1 |
| 11 | Ի | Ի | 20 | 2 |
| 12 | Լ | Լ | 30 | 3 |
| 13 | Խ | Խ | 40 | 4 |
| 14 | Ծ | Ծ | 50 | 5 |
| 15 | Կ | Կ | 60 | 6 |
| 16 | Հ | Հ | 70 | 7 |
| 17 | Ձ | Ձ | 80 | 8 |
| 18 | Ղ | Ղ | 90 | 9 |
| 19 | Ճ | Ճ | 100 | 1 |
| 20 | Մ | Մ | 200 | 2 |
| 21 | Յ | Յ | 300 | 3 |
| 22 | Ն | Ն | 400 | 4 |
| 23 | Շ | Շ | 500 | 5 |
| 24 | Ո | Ո | 600 | 6 |
| 25 | Չ | Չ | 700 | 7 |
| 26 | Պ | Պ | 800 | 8 |
| 27 | Ջ | Ջ | 900 | 9 |
| 28 | Ռ | Ռ | 1000 | 1 |
| 29 | Ս | Ս | 2000 | 2 |
| 30 | Վ | Վ | 3000 | 3 |
| 31 | Տ | Տ | 4000 | 4 |
| 32 | Ր | Ր | 5000 | 5 |
| 33 | Ց | Ց | 6000 | 6 |
| 34 | **Ւ** | **Ու** | Ւ = 7000 · Ու: §3.2 | Ւ = 7 · Ու: §3.3 |
| 35 | Փ | Փ | 8000 | 8 |
| 36 | Ք | Ք | 9000 | 9 |
| 37 | — | **և** | §3.2 | §3.3 |
| 38 | — | **Օ** | §3.2 | §3.3 |
| 39 | — | **Ֆ** | §3.2 | §3.3 |

The 36 Grabar letters form four rows of nine (units, tens, hundreds, thousands). A letter's column (1–9) is its value with the zeros removed.

### 1.2 Tokenization (splitting text into letters)

**Grabar: every character is always its own letter.** Nothing is merged. The ligature `և` (U+0587) is written out as its two characters, Ե · Ւ.

**Ashkharabar: two letters are written with more than one character**, and all their spellings are one letter:

| Letter ᴬ | Accepted spellings (any case) |
|---|---|
| Ու (№34) | `ու`, `Ու`, `ՈՒ` |
| և (№37) | `և`, `եւ`, `Եւ`, `ԵՒ`, `եվ`, `Եվ`, `ԵՎ` |

Every `եվ` in ᴬ is read as և. For example, `Եվրոպա` → և · Ր · Ո · Պ · Ա. This is intended.

| Input | ᴳ Grabar | ᴬ Ashkharabar |
|---|---|---|
| `ու` | two letters: Ո · Ւ | one letter: Ու |
| `և` / `եւ` | two letters: Ե · Ւ | one letter: և |
| `եվ` | two letters: Ե · Վ | one letter: և |
| `ւ` not after `ո`/`ե` | Ւ (№34) | **⊥** (not a letter of ᴬ) |
| `Օ`, `Ֆ` | **⊥** (not a letter of ᴳ) | Օ (№38), Ֆ (№39) |

- Upper and lower case are the same letter.
- Spaces separate words. Punctuation and digits are ignored.
- **⊥** means "undefined." Any value that depends on a ⊥ letter is itself ⊥, and the derivation must name the letter that caused it.

---

## 2. Objects

| Concept | Unicode | ASCII | Example |
|---|---|---|---|
| Word / phrase | `⟨w⟩ᴬ` | `<w>A` | `⟨Հայկ⟩ᴳ` |
| Letter sequence (tokenized) | `Հ·Ա·Յ·Կ` | `Հ.Ա.Յ.Կ` | shows how text was split |
| Undefined | `⊥` | `_|_` | |

---

## 3. Values

Every letter has **two distinct values**, and the notation keeps them apart.

| Value | Armenian | Unicode | ASCII | Meaning |
|---|---|---|---|---|
| Numeric | թվային արժեք | `#` | `#` | Sum of the letters' numeric values (table §1.1) |
| Serial | կարգաթիվ | `№` | `N` | Sum of the letters' positions in the alphabet |

Numeric values can also be reduced, in two ways (§3.3).

### 3.1 Serial value №

Fully defined in both alphabets. It depends on the alphabet whenever Ու / Ւ / և / Օ / Ֆ appear.

```
№⟨Հայկ⟩ᴳ = 16+1+21+15 = 53
№⟨Հուր⟩ᴳ = 16+24+34+32 = 106      Հ·Ո·Ւ·Ր
№⟨Հուր⟩ᴬ = 16+34+32 = 82          Հ·Ու·Ր
```

### 3.2 Numeric modes

Ու, և, Օ and Ֆ have no traditional numeric value. TirN defines **three modes, all equal in status**. The mode **must be written** whenever an ᴬ word contains one of these letters.

| Mode | Unicode | ASCII | Ու | և | Օ | Ֆ |
|---|---|---|---:|---:|---:|---:|
| Decompose | `#ᵈ` | `#d` | 7600 (Ո+Ւ) | 7005 (Ե+Ւ) | 0 | 0 |
| Inherit | `#ⁱ` | `#i` | 7000 (as Ւ) | 0 | 0 | 0 |
| Strict | `#ˢ` | `#s` | ⊥ | ⊥ | ⊥ | ⊥ |

- In Grabar, all three modes give the same result, because none of these letters exist there.
- Decompose mode makes `#` agree across alphabets: `#ᵈ⟨Հուր⟩ᴬ = #⟨Հուր⟩ᴳ = 12670`.

**Spread operator `#*`** shows all modes side by side, for comparison:

```
#*⟨Հուր⟩ᴬ = { ᵈ 12670 · ⁱ 12070 · ˢ ⊥(Ու) }
```

### 3.3 Reduction

There are two reduction methods, both available.

| Method | Unicode | ASCII | Rule |
|---|---|---|---|
| Total reduction | `#₁`, `№₁` | `#1`, `N1` | Compute the value, then repeatedly sum its digits until one digit remains |
| Column sum | `#ₖ` | `#k` | Replace each letter by its column digit (§1.1), then sum. **Not reduced further.** |
| Column sum, reduced | `#ₖ₁` | `#k1` | Column sum, then repeatedly sum its digits |

`#ₖ` is a value in its own right (the middle number), not just a step on the way to one digit. `#ₖ₁` always equals `#₁`, because both are the digital root of the same number. Only `#ₖ` gives new information.

`#ₖ` exists only for numeric values. Serial positions have no columns.

**Column digits for the ᴬ-only letters, by mode:**

| Mode | Ու | և | Օ | Ֆ |
|---|---:|---:|---:|---:|
| ᵈ decompose | 13 (Ո 6 + Ւ 7) | 12 (Ե 5 + Ւ 7) | 0 | 0 |
| ⁱ inherit | 7 | 0 | 0 | 0 |
| ˢ strict | ⊥ | ⊥ | ⊥ | ⊥ |

Modes and reductions combine: `#ᵈₖ`, `#ⁱ₁`, `#*ₖ` (ASCII `#dk`, `#i1`, `#*k`).

Examples:

```
#₁⟨Հայկ⟩ᴳ  = 431 ⟶ 4+3+1 = 8
#ₖ⟨Հայկ⟩ᴳ  = 7+1+3+6 = 17
#ₖ₁⟨Հայկ⟩ᴳ = 17 ⟶ 1+7 = 8

#⟨Արամ⟩ᴳ   = 1+5000+1+200 = 5202
#ₖ⟨Արամ⟩ᴳ  = 1+5+1+2 = 9

№₁⟨Հուր⟩ᴳ  = 106 ⟶ 1+0+6 = 7
```

---

## 4. Ciphers (Temurah) — `σ`

A cipher is a **permutation of the alphabet**, applied letter by letter. *n* = alphabet length (36 or 39), *i* = a letter's position. Results depend on the alphabet.

| Cipher | Unicode | ASCII | Rule |
|---|---|---|---|
| Atbash | `σ:atbash` | `atbash` | *i* ↦ *n*+1−*i* |
| Shift by *k* (Avgad = +1) | `σ:+k` / `σ:−k` | `shift+k` | *i* ↦ ((*i*−1+*k*) mod *n*)+1 |
| Albam, swap halves | `σ:albam` | `albam` | defined below |

**Albam.** In Grabar (*n* = 36), shift by 18. This is self-inverse. Ashkharabar has *n* = 39, which is odd, so there are two variants, both available:

| Variant | Unicode | ASCII | Rule (ᴬ) | Self-inverse |
|---|---|---|---|---|
| Pivot | `σ:albamᵖ` | `albam.p` | 1–19 ↔ 21–39; №20 (Մ) is fixed | yes |
| Shift | `σ:albamˢ` | `albam.s` | shift by 19 | no |

Examples:

```
σ:atbash ⟨Հայկ⟩ᴳ = ⟨ՅՔՀՆ⟩ᴳ        i ↦ 37−i
σ:atbash ⟨Հայկ⟩ᴬ = ⟨ՈՖՃՉ⟩ᴬ        i ↦ 40−i
σ:atbash ⟨Հուր⟩ᴳ = ⟨ՅԽԳԵ⟩ᴳ
σ:atbash ⟨Հուր⟩ᴬ = ⟨ՈԶԸ⟩ᴬ
```

---

## 5. Notarikon — `↑` / `↓`

| Operation | Unicode | ASCII | Nature |
|---|---|---|---|
| Acronym (compress) | `↑⟨w₁ w₂ …⟩` | `^<…>` | function: first letter of each word |
| Expansion | `↓[dict:name]⟨w⟩` | `v[dict:name]<w>` | relation: one word → many possible phrases |

- The first letter follows the alphabet's tokenization. In ᴬ, Ու and և always count as one full letter: `↑⟨Ուրախ օր⟩ᴬ = ⟨ՈւՕ⟩ᴬ`. In ᴳ, `Ուրախ` begins with Ո.
- `↓` needs a lexicon. **tirjs contains none. The client code must always supply one**, and the derivation must name it.

```
↑⟨Հայոց Այբուբեն Յուրահատուկ Կերտված⟩ᴬ = ⟨ՀԱՅԿ⟩ᴬ
```

---

## 6. Relations

| Relation | Unicode | ASCII | True when |
|---|---|---|---|
| Anagram | `a ∼ b` | `a ~ b` | same multiset of letters (after tokenization) |
| Equal numeric value | `a ≡# b` | `a =# b` | `#a = #b` (write the mode if needed: `≡#ᵈ`) |
| Equal column sum | `a ≡#ₖ b` | `a =#k b` | `#ₖa = #ₖb` |
| Equal serial value | `a ≡№ b` | `a =N b` | `№a = №b` |
| Equal reduced value | `a ≡#₁ b`, `a ≡№₁ b` | `=#1`, `=N1` | reduced values are equal |

An anagram **permutes positions**, while a cipher **permutes the alphabet**. That's why they have different symbols (`∼` vs `σ`).

`∼` depends on the alphabet: `⟨ու⟩` is two letters in ᴳ but one letter in ᴬ.

---

## 7. Composition

**On paper**, operators apply right to left, as in mathematics:

```
#₁ σ:atbash ⟨Հայկ⟩ᴳ = #₁⟨ՅՔՀՆ⟩ᴳ = 9770 ⟶ 23 ⟶ 5
#ₖ σ:atbash ⟨Հայկ⟩ᴳ = #ₖ⟨ՅՔՀՆ⟩ᴳ = 3+9+7+4 = 23
```

**In ASCII and code**, a left-to-right pipeline is preferred:

```
<Հայկ>G |> atbash |> #1   =>  5
<Հայկ>G |> atbash |> #k   =>  23
```

---

## 8. Derivations

A derivation is a numbered list of lines. Each line has a justification on the right that cites the operation and the earlier lines it uses.

```
    alphabet ᴳ
1.  ⟨Հուր⟩ᴳ = Հ·Ո·Ւ·Ր                       given; tokenize
2.  #⟨Հուր⟩ᴳ = 70+600+7000+5000 = 12670     #, 1
3.  #₁⟨Հուր⟩ᴳ = 12670 ⟶ 16 ⟶ 7              reduce, 2
4.  #ₖ⟨Հուր⟩ᴳ = 7+6+7+5 = 25                column sum, 1
5.  №⟨Հուր⟩ᴳ = 16+24+34+32 = 106            №, 1
6.  №₁⟨Հուր⟩ᴳ = 106 ⟶ 7                     reduce, 5
7.  σ:atbash ⟨Հուր⟩ᴳ = ⟨ՅԽԳԵ⟩ᴳ              atbash (i ↦ 37−i), 1
8.  #⟨ՅԽԳԵ⟩ᴳ = 300+40+3+5 = 348             #, 7

    alphabet ᴬ
9.  ⟨Հուր⟩ᴬ = Հ·Ու·Ր                        given; tokenize
10. #*⟨Հուր⟩ᴬ  = { ᵈ 12670 · ⁱ 12070 · ˢ ⊥(Ու) }   spread, 9
11. #*ₖ⟨Հուր⟩ᴬ = { ᵈ 25 · ⁱ 19 · ˢ ⊥(Ու) }         column sum, 9
12. №⟨Հուր⟩ᴬ = 16+34+32 = 82                №, 9
13. ⟨Հուր⟩ᴳ ≡# ⟨Հուր⟩ᴬ  under ᵈ only         2, 10
```

Rules:
- Every line states the alphabet (on the line, or for the block, as above).
- Every numeric value of an ᴬ word containing Ու / և / Օ / Ֆ states its mode, or uses `#*`.
- Every `↓` states its lexicon.
- Every ⊥ names the letter that caused it.

---

## 9. Grammar (EBNF)

```ebnf
derivation = { line } ;
line       = [ number "." ] statement [ justification ] ;
statement  = expr [ rel expr ] ;

expr       = word
           | value expr
           | cipher expr
           | "↑" expr
           | "↓" "[" "dict:" name "]" expr
           | expr "|>" pipe-op ;              (* ASCII pipeline *)

word       = "⟨" letters { " " letters } "⟩" alphabet ;
alphabet   = "ᴳ" | "ᴬ" ;                     (* ASCII: G | A *)

value      = "#" [ mode | "*" ] [ reduction ]
           | "№" [ "₁" ] ;
mode       = "ᵈ" | "ⁱ" | "ˢ" ;                (* ASCII: d | i | s *)
reduction  = "₁" | "ₖ" | "ₖ₁" ;              (* ASCII: 1 | k | k1 *)

cipher     = "σ:" ( "atbash" | "albam" [ "ᵖ" | "ˢ" ] | ( "+" | "−" ) int ) ;

rel        = "=" | "∼" | "≡#" [ mode ] [ reduction ] | "≡№" [ "₁" ] ;
```

---

## 10. `tirjs` API mapping

Call shapes, return values, and errors are specified in [the function reference](api.md). [Ciphers](ciphers.md), [acronyms](acronyms.md), and [relations](relations.md) each have their own page, with the TirN line written above the call.

| TirN | `tirjs` |
|---|---|
| `⟨w⟩ᴬ` tokenize | `letters(w, { alphabet: "A" })` |
| `#ᵈ⟨w⟩ᴬ` | `value(w, { alphabet: "A", mode: "decompose" })` |
| `#ⁱ`, `#ˢ` | `mode: "inherit"`, `mode: "strict"` |
| `#*⟨w⟩ᴬ` | `valueAll(w, { alphabet: "A" })` → `{ decompose, inherit, strict }` |
| `#ₖ⟨w⟩` | `columnSum(w, { alphabet, mode })` |
| `#*ₖ⟨w⟩` | `columnSumAll(w, { alphabet })` |
| `№⟨w⟩ᴳ` | `serial(w, { alphabet: "G" })` |
| `#₁`, `#ₖ₁`, `№₁` | `reduce(n)` (digital root of any number) |
| `σ:atbash` | `permute(w, "atbash", { alphabet })` |
| `σ:+k` | `permute(w, { shift: k }, { alphabet })` |
| `σ:albamᵖ` / `σ:albamˢ` | `permute(w, "albam.pivot", { alphabet })` / `permute(w, "albam.shift", { alphabet })` |
| `↑⟨p⟩` | `acronym(p, { alphabet })` |
| `↓[dict:d]⟨w⟩` | `expand(w, { name, phrases }, { alphabet })` |
| `a ∼ b` | `isAnagram(a, b, { alphabet })` |
| `a ≡# b` / `a ≡#ₖ b` / `a ≡№ b` | `sameValue` / `sameColumnSum` / `sameSerial`, each `(a, b, opts)` |
| derivation block | `derive(steps, { format: "unicode" \| "ascii" })` |

A result that can be ⊥ is `{ value, undefinedBy }`. `value` is `null` when the result is undefined, and `undefinedBy` names the letters that caused it. A defined result uses the same object: `value` holds the result and `undefinedBy` is empty. `reduce` returns a number.

`derive` steps are plain objects. An `alphabet` step sets the alphabet for the following lines. Statement steps are `tokenize`, `value`, `column`, `serial`, `reduce`, `cipher`, `acronym`, `expand`, `anagram`, and `same`. `value` and `column` take `mode: "decompose" | "inherit" | "strict" | "*"`. The caller writes `format` as `"unicode"` or `"ascii"`.

---

## 11. Decisions log

| # | Decision |
|---|---|
| 1 | Armenian only. |
| 2 | Two alphabets: Grabar (36) and Ashkharabar (39). The alphabet is always written. |
| 3 | Two letter values: numeric `#` and serial `№`. |
| 4 | Three numeric modes for Ու / և / Օ / Ֆ (decompose, inherit, strict), all equal in status, plus the spread `#*`. |
| 5 | ᴬ: Ու and all spellings of և (`և`, `եւ`, `եվ`, any case) are single letters, including in acronyms. `Եվրոպա` starts with և. |
| 6 | ᴳ: every character is always its own letter. |
| 7 | Two reductions: total (`#₁`, `№₁`) and column sum (`#ₖ`, `#ₖ₁`). |
| 8 | Albam in ᴬ has two variants (pivot, shift). |
| 9 | No lexicon in tirjs. Client code supplies it. |
| 10 | ⊥ is `{ value: null, undefinedBy }`. A defined result is the same object with an empty `undefinedBy`. |
| 11 | Ashkharabar albam is `albam.pivot` or `albam.shift`. On Grabar those names, and bare `albam`, are the half-swap. |
