import { type Defined, type TextOptions } from "./alphabet.js";
import { tokenize } from "./letters.js";

export const acronym = (text: string, options: TextOptions): Defined<string> => {
  const tokenized = tokenize(text, options.alphabet);
  if (tokenized.value === null) {
    return { value: null, undefinedBy: tokenized.undefinedBy };
  }
  return {
    value: tokenized.value.map((word) => word[0] ?? "").join(""),
    undefinedBy: [],
  };
};
