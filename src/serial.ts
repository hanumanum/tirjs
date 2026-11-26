import { positionOf, type Defined, type TextInput, type TextOptions } from "./alphabet.js";
import { scoreText } from "./letters.js";

export const serial = (text: TextInput, options: TextOptions): Defined<number> => {
  const scored = scoreText(text, options.alphabet, (letter) =>
    positionOf(letter, options.alphabet),
  );
  return { value: scored.value, undefinedBy: scored.undefinedBy };
};
