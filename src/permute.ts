import {
  alphabetSize,
  assertAlphabet,
  letterAt,
  positionOf,
  type Alphabet,
  type Defined,
  type TextOptions,
} from "./alphabet.js";
import { tokenize } from "./letters.js";

export type NamedCipher = "atbash" | "albam" | "albam.pivot" | "albam.shift";

export type Cipher = NamedCipher | { readonly shift: number };

const mod = (value: number, size: number): number => ((value % size) + size) % size;

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
  text: string,
  cipher: Cipher,
  options: TextOptions,
): Defined<string> => {
  assertAlphabet(options.alphabet);
  const mapPosition = destination(cipher, options.alphabet);
  const tokenized = tokenize(text, options.alphabet);
  if (tokenized.value === null) {
    return { value: null, undefinedBy: tokenized.undefinedBy };
  }
  const words = tokenized.value.map((word) =>
    word
      .map((letter) => {
        const position = positionOf(letter, options.alphabet);
        if (position === null) return letter;
        return letterAt(options.alphabet, mapPosition(position)) ?? letter;
      })
      .join(""),
  );
  return { value: words.join(" "), undefinedBy: [] };
};
