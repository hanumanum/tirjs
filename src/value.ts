import {
  numericOf,
  type Defined,
  type NumericMode,
  type TextInput,
  type TextOptions,
  type ValueOptions,
} from "./alphabet.js";
import { scoreText } from "./letters.js";

const total = (text: TextInput, options: ValueOptions): Defined<number> => {
  const scored = scoreText(text, options.alphabet, (letter) =>
    numericOf(letter, options.alphabet, options.mode),
  );
  return { value: scored.value, undefinedBy: scored.undefinedBy };
};

export const value = (text: TextInput, options: ValueOptions): Defined<number> =>
  total(text, options);

export const valueAll = (
  text: TextInput,
  options: TextOptions,
): { readonly [Mode in NumericMode]: Defined<number> } => ({
  decompose: value(text, { alphabet: options.alphabet, mode: "decompose" }),
  inherit: value(text, { alphabet: options.alphabet, mode: "inherit" }),
  strict: value(text, { alphabet: options.alphabet, mode: "strict" }),
});
