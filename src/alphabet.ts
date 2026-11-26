import alphabets from "../knowledge/alphabets.json" with { type: "json" };

export type Alphabet = "G" | "A";

export type NumericMode = "decompose" | "inherit" | "strict";

export const numericModes = ["decompose", "inherit", "strict"] as const;

export type Defined<T> = {
  readonly value: T | null;
  readonly undefinedBy: readonly string[];
};

export type TextOptions = {
  readonly alphabet: Alphabet;
};

export type ValueOptions = {
  readonly alphabet: Alphabet;
  readonly mode?: NumericMode;
};

type ModeAmounts = {
  readonly numeric: number;
  readonly column: number;
};

type TableLetter = {
  readonly letter: string;
  readonly position: number;
  readonly numeric: number | null;
  readonly column: number | null;
  readonly modes: {
    readonly decompose: ModeAmounts;
    readonly inherit: ModeAmounts;
    readonly strict: null;
  } | null;
};

type AlphabetTable = {
  readonly grabar: readonly TableLetter[];
  readonly ashkharabar: readonly TableLetter[];
};

const table = alphabets as AlphabetTable;

const order = (letters: readonly TableLetter[]): readonly TableLetter[] =>
  [...letters].sort((left, right) => left.position - right.position);

const grabar = order(table.grabar);
const ashkharabar = order(table.ashkharabar);

if (grabar.length !== 36 || ashkharabar.length !== 39) {
  throw new Error("alphabet table is incomplete");
}

const lettersOf = (alphabet: Alphabet): readonly TableLetter[] =>
  alphabet === "G" ? grabar : ashkharabar;

const byLetter = (letters: readonly TableLetter[]): ReadonlyMap<string, TableLetter> =>
  new Map(letters.map((letter) => [letter.letter, letter]));

const grabarByLetter = byLetter(grabar);
const ashkharabarByLetter = byLetter(ashkharabar);

export const assertAlphabet: (alphabet: string) => asserts alphabet is Alphabet = (alphabet) => {
  if (alphabet !== "G" && alphabet !== "A") {
    throw new Error("alphabet must be G or A");
  }
};

const find = (letter: string, alphabet: Alphabet): TableLetter | undefined =>
  (alphabet === "G" ? grabarByLetter : ashkharabarByLetter).get(letter);

export const alphabetSize = (alphabet: Alphabet): number => {
  assertAlphabet(alphabet);
  return lettersOf(alphabet).length;
};

export const letterAt = (alphabet: Alphabet, position: number): string | null => {
  assertAlphabet(alphabet);
  return lettersOf(alphabet)[position - 1]?.letter ?? null;
};

export const positionOf = (letter: string, alphabet: Alphabet): number | null => {
  assertAlphabet(alphabet);
  return find(letter, alphabet)?.position ?? null;
};

const amountOf = (
  letter: string,
  alphabet: Alphabet,
  mode: NumericMode | undefined,
  field: "numeric" | "column",
): number | null => {
  assertAlphabet(alphabet);
  const record = find(letter, alphabet);
  if (record === undefined) return null;
  if (record.modes === null) return record[field];
  if (mode === undefined) {
    throw new Error(
      "Ashkharabar letters Ու, և, Օ, and Ֆ need a numeric mode: decompose, inherit, or strict",
    );
  }
  const entry = record.modes[mode];
  return entry === null ? null : entry[field];
};

export const numericOf = (
  letter: string,
  alphabet: Alphabet,
  mode?: NumericMode,
): number | null => amountOf(letter, alphabet, mode, "numeric");

export const columnOf = (
  letter: string,
  alphabet: Alphabet,
  mode?: NumericMode,
): number | null => amountOf(letter, alphabet, mode, "column");
