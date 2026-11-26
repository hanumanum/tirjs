import {
  alphabetSize,
  assertAlphabet,
  letterAt,
  positionOf,
  type Alphabet,
  type Spelling,
  type TextInput,
  type TextOptions,
} from "../alphabet.js";
import { read } from "../letters.js";

export type NamedCipher = "atbash" | "albam" | "albam.pivot" | "albam.shift";

export type Cipher = NamedCipher | { readonly shift: number };

const mod = (value: number, size: number): number => ((value % size) + size) % size;

const unique = (items: readonly string[]): readonly string[] =>
  items.filter((item, index) => items.indexOf(item) === index);

const isNamed = (cipher: Cipher): cipher is NamedCipher =>
  cipher === "atbash" ||
  cipher === "albam" ||
  cipher === "albam.pivot" ||
  cipher === "albam.shift";

const destination = (cipher: Cipher, alphabet: Alphabet): ((position: number) => number) => {
  const size = alphabetSize(alphabet);
  if (typeof cipher === "object") {
    if (!Number.isInteger(cipher.shift)) throw new Error("shift expects an integer");
    return (position) => mod(position - 1 + cipher.shift, size) + 1;
  }
  if (!isNamed(cipher)) throw new Error("unknown cipher");
  if (cipher === "atbash") return (position) => size + 1 - position;
  if (size % 2 === 0) {
    const half = size / 2;
    return (position) => mod(position - 1 + half, size) + 1;
  }
  if (cipher === "albam") {
    throw new Error("Ashkharabar albam needs a variant: albam.pivot or albam.shift");
  }
  if (cipher === "albam.shift") return (position) => mod(position - 1 + 19, size) + 1;
  return (position) => {
    if (position <= 19) return position + 20;
    if (position === 20) return 20;
    return position - 20;
  };
};

export const permute = (
  text: TextInput,
  cipher: Cipher,
  options: TextOptions,
): Spelling => {
  assertAlphabet(options.alphabet);
  const mapPosition = destination(cipher, options.alphabet);
  const tokenized = read(text, options.alphabet);
  if (tokenized.value === null) {
    return { value: null, letters: null, undefinedBy: tokenized.undefinedBy };
  }
  const placed = tokenized.value.map((word) =>
    word.map((letter) => {
      const position = positionOf(letter, options.alphabet);
      const mapped = position === null ? null : letterAt(options.alphabet, mapPosition(position));
      return { letter, mapped };
    }),
  );
  const missing = unique(
    placed.flat().flatMap((item) => (item.mapped === null ? [item.letter] : [])),
  );
  if (missing.length > 0) {
    return { value: null, letters: null, undefinedBy: missing };
  }
  const words = placed.map((word) => word.map((item) => item.mapped ?? item.letter));
  return {
    value: words.map((word) => word.join("")).join(" "),
    letters: words,
    undefinedBy: [],
  };
};
