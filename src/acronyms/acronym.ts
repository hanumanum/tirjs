import { type Defined, type TextInput, type TextOptions } from "../alphabet.js";
import { read } from "../letters.js";

export const acronym = (text: TextInput, options: TextOptions): Defined<string> => {
  const tokenized = read(text, options.alphabet);
  if (tokenized.value === null) {
    return { value: null, undefinedBy: tokenized.undefinedBy };
  }
  return {
    value: tokenized.value.map((word) => word[0] ?? "").join(""),
    undefinedBy: [],
  };
};
