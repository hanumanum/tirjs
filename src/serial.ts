import { positionOf, type Defined, type TextOptions } from "./alphabet.js";
import { scoreText } from "./letters.js";

export const serial = (text: string, options: TextOptions): Defined<number> => {
  const scored = scoreText(text, options.alphabet, (letter) =>
    positionOf(letter, options.alphabet),
  );
  return { value: scored.value, undefinedBy: scored.undefinedBy };
};
