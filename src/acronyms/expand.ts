import { type Defined, type TextOptions } from "../alphabet.js";
import { acronym } from "./acronym.js";
import { letters } from "../letters.js";

export type Lexicon = {
  readonly name: string;
  readonly phrases: readonly string[];
};

export const expand = (
  word: string,
  lexicon: Lexicon,
  options: TextOptions,
): Defined<readonly string[]> => {
  const target = letters(word, options);
  if (target.value === null) {
    return { value: null, undefinedBy: target.undefinedBy };
  }
  const compressed = target.value.join("");
  return {
    value: lexicon.phrases.filter((phrase) => acronym(phrase, options).value === compressed),
    undefinedBy: [],
  };
};
