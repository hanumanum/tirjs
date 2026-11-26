import {
  columnOf,
  type Defined,
  type NumericMode,
  type TextInput,
  type TextOptions,
  type ValueOptions,
} from "./alphabet.js";
import { scoreText } from "./letters.js";

export const columnSum = (text: TextInput, options: ValueOptions): Defined<number> => {
  const scored = scoreText(text, options.alphabet, (letter) =>
    columnOf(letter, options.alphabet, options.mode),
  );
  return { value: scored.value, undefinedBy: scored.undefinedBy };
};

export const columnSumAll = (
  text: TextInput,
  options: TextOptions,
): { readonly [Mode in NumericMode]: Defined<number> } => ({
  decompose: columnSum(text, { alphabet: options.alphabet, mode: "decompose" }),
  inherit: columnSum(text, { alphabet: options.alphabet, mode: "inherit" }),
  strict: columnSum(text, { alphabet: options.alphabet, mode: "strict" }),
});
