import {
  assertAlphabet,
  positionOf,
  type Alphabet,
  type Defined,
  type TextOptions,
} from "./alphabet.js";

export type Breakdown = {
  readonly value: number | null;
  readonly undefinedBy: readonly string[];
  readonly parts: readonly number[];
};

type Scan = {
  readonly letters: readonly string[];
  readonly causes: readonly string[];
};

const isSkippable = (char: string): boolean => /[\p{P}\p{S}\p{N}\p{M}]/u.test(char);

const foldChar = (char: string): string => {
  const code = char.codePointAt(0);
  if (code !== undefined && code >= 0x0561 && code <= 0x0586) {
    return String.fromCodePoint(code - 0x30);
  }
  return char;
};

const unique = (items: readonly string[]): readonly string[] =>
  items.filter((item, index) => items.indexOf(item) === index);

const scan = (segment: string, alphabet: Alphabet): Scan => {
  const letters: string[] = [];
  const causes: string[] = [];

  for (let index = 0; index < segment.length; ) {
    const char = segment[index] ?? "";
    if (isSkippable(char)) {
      index += 1;
      continue;
    }

    if (alphabet === "G") {
      if (char === "և") {
        letters.push("Ե", "Ւ");
      } else {
        const folded = foldChar(char);
        if (positionOf(folded, "G") !== null) letters.push(folded);
        else causes.push(folded);
      }
      index += 1;
      continue;
    }

    const first = foldChar(char);
    const second = foldChar(segment[index + 1] ?? "");
    if (first === "Ո" && second === "Ւ") {
      letters.push("Ու");
      index += 2;
      continue;
    }
    if (char === "և" || (first === "Ե" && (second === "Ւ" || second === "Վ"))) {
      letters.push("և");
      index += char === "և" ? 1 : 2;
      continue;
    }
    if (positionOf(first, "A") !== null) letters.push(first);
    else causes.push(first);
    index += 1;
  }

  return { letters, causes };
};

export const tokenize = (
  text: string,
  alphabet: Alphabet,
): Defined<readonly (readonly string[])[]> => {
  assertAlphabet(alphabet);
  const scanned = text
    .split(/\s+/u)
    .filter((segment) => segment.length > 0)
    .map((segment) => scan(segment, alphabet));
  const undefinedBy = unique(scanned.flatMap((item) => item.causes));
  if (undefinedBy.length > 0) return { value: null, undefinedBy };
  return {
    value: scanned.map((item) => item.letters).filter((word) => word.length > 0),
    undefinedBy: [],
  };
};

export const letters = (text: string, options: TextOptions): Defined<readonly string[]> => {
  const tokenized = tokenize(text, options.alphabet);
  if (tokenized.value === null) {
    return { value: null, undefinedBy: tokenized.undefinedBy };
  }
  return { value: tokenized.value.flat(), undefinedBy: [] };
};

export const scoreText = (
  text: string,
  alphabet: Alphabet,
  amountOf: (letter: string) => number | null,
): Breakdown => {
  const tokenized = tokenize(text, alphabet);
  if (tokenized.value === null) {
    return { value: null, undefinedBy: tokenized.undefinedBy, parts: [] };
  }

  const collected = tokenized.value.flat().reduce<{
    readonly parts: readonly number[];
    readonly causes: readonly string[];
  }>(
    (acc, letter) => {
      const amount = amountOf(letter);
      return amount === null
        ? { parts: acc.parts, causes: [...acc.causes, letter] }
        : { parts: [...acc.parts, amount], causes: acc.causes };
    },
    { parts: [], causes: [] },
  );
  const undefinedBy = unique(collected.causes);
  if (undefinedBy.length > 0) return { value: null, undefinedBy, parts: [] };
  return {
    value: collected.parts.reduce((sum, part) => sum + part, 0),
    undefinedBy: [],
    parts: collected.parts,
  };
};
