import {
  alphabetSize,
  columnOf,
  numericModes,
  numericOf,
  positionOf,
  type Alphabet,
  type NumericMode,
} from "./alphabet.js";
import { acronym } from "./acronyms/acronym.js";
import { expand, type Lexicon } from "./acronyms/expand.js";
import { scoreText, tokenize, type Breakdown } from "./letters.js";
import { permute, type Cipher } from "./ciphers/permute.js";
import { reduceTrace } from "./reduce.js";

export type DerivationFormat = "unicode" | "ascii";

type Basis = "value" | "column" | "serial";

export type DerivationStep =
  | { readonly op: "alphabet"; readonly alphabet: Alphabet }
  | { readonly op: "tokenize"; readonly text: string }
  | { readonly op: "value"; readonly line: number; readonly mode?: NumericMode | "*" }
  | { readonly op: "column"; readonly line: number; readonly mode?: NumericMode | "*" }
  | { readonly op: "serial"; readonly line: number }
  | { readonly op: "reduce"; readonly line: number }
  | { readonly op: "cipher"; readonly line: number; readonly cipher: Cipher }
  | { readonly op: "acronym"; readonly text: string }
  | { readonly op: "expand"; readonly text: string; readonly lexicon: Lexicon }
  | { readonly op: "anagram"; readonly left: string; readonly right: string }
  | {
      readonly op: "same";
      readonly by: Basis;
      readonly left: number;
      readonly right: number;
      readonly mode?: NumericMode;
    };

type WordLine = {
  readonly kind: "word";
  readonly text: string;
  readonly alphabet: Alphabet;
  readonly words: readonly (readonly string[])[] | null;
  readonly undefinedBy: readonly string[];
};

type AmountLine = {
  readonly kind: "amount";
  readonly basis: Basis;
  readonly reduced: boolean;
  readonly mode?: NumericMode | "*";
  readonly text: string;
  readonly alphabet: Alphabet;
  readonly amount: number | null;
  readonly undefinedBy: readonly string[];
  readonly parts: readonly number[];
  readonly trace: readonly number[];
};

type SpreadLine = {
  readonly kind: "spread";
  readonly basis: "value" | "column";
  readonly text: string;
  readonly alphabet: Alphabet;
  readonly modes: { readonly [Mode in NumericMode]: Breakdown };
};

type NoteLine = { readonly kind: "note" };

type Line = WordLine | AmountLine | SpreadLine | NoteLine;

const mark = (alphabet: Alphabet, format: DerivationFormat): string =>
  format === "ascii" ? alphabet : alphabet === "G" ? "ᴳ" : "ᴬ";

const wrap = (text: string, alphabet: Alphabet, format: DerivationFormat): string =>
  format === "unicode" ? `⟨${text}⟩${mark(alphabet, format)}` : `<${text}>${alphabet}`;

const dot = (format: DerivationFormat): string => (format === "unicode" ? "·" : ".");

const arrow = (format: DerivationFormat): string => (format === "unicode" ? "⟶" : "->");

const minus = (format: DerivationFormat): string => (format === "unicode" ? "−" : "-");

const mapsTo = (format: DerivationFormat): string => (format === "unicode" ? "↦" : "->");

const gap = (causes: readonly string[], format: DerivationFormat): string =>
  `${format === "unicode" ? "⊥" : "_|_"}(${causes.join(", ")})`;

const modeMark = (mode: NumericMode, format: DerivationFormat): string => {
  if (format === "ascii") return mode === "decompose" ? "d" : mode === "inherit" ? "i" : "s";
  if (mode === "decompose") return "ᵈ";
  if (mode === "inherit") return "ⁱ";
  return "ˢ";
};

const modeText = (mode: NumericMode | "*" | undefined, format: DerivationFormat): string => {
  if (mode === undefined) return "";
  if (mode === "*") return "*";
  return modeMark(mode, format);
};

const operator = (
  basis: Basis,
  mode: NumericMode | "*" | undefined,
  reduced: boolean,
  format: DerivationFormat,
): string => {
  if (basis === "serial") {
    if (format === "unicode") return reduced ? "№₁" : "№";
    return reduced ? "N1" : "N";
  }
  const suffix =
    basis === "column"
      ? `${format === "unicode" ? "ₖ" : "k"}${reduced ? (format === "unicode" ? "₁" : "1") : ""}`
      : reduced
        ? format === "unicode"
          ? "₁"
          : "1"
        : "";
  return `#${modeText(mode, format)}${suffix}`;
};

const showParts = (parts: readonly number[], total: number): string =>
  parts.length > 1 ? `${parts.join("+")} = ${total}` : String(total);

const showTrace = (trace: readonly number[], format: DerivationFormat): string =>
  trace.join(` ${arrow(format)} `);

const sequence = (
  words: readonly (readonly string[])[],
  format: DerivationFormat,
): string => words.flat().join(dot(format));

const row = (number: number, body: string, because: string): string =>
  `${number}. ${body}    ${because}`;

const cipherLabel = (cipher: Cipher, format: DerivationFormat): string => {
  if (typeof cipher === "object") {
    const sign = cipher.shift < 0 ? minus(format) : "+";
    const body = `shift${sign}${Math.abs(cipher.shift)}`;
    return format === "unicode" ? `σ:${sign}${Math.abs(cipher.shift)}` : body;
  }
  if (cipher === "atbash") return format === "unicode" ? "σ:atbash" : "atbash";
  if (cipher === "albam.pivot") return format === "unicode" ? "σ:albamᵖ" : "albam.p";
  if (cipher === "albam.shift") return format === "unicode" ? "σ:albamˢ" : "albam.s";
  return format === "unicode" ? "σ:albam" : "albam";
};

const at = (lines: readonly Line[], number: number): Line => {
  const line = lines[number - 1];
  if (line === undefined) throw new Error(`derivation line ${number} is out of range`);
  return line;
};

const requireAlphabet = (alphabet: Alphabet | null): Alphabet => {
  if (alphabet === null) throw new Error("derivation has no alphabet");
  return alphabet;
};

const requireWord = (line: Line, number: number): WordLine => {
  if (line.kind !== "word") throw new Error(`derivation line ${number} is not a word`);
  return line;
};

const score = (
  text: string,
  alphabet: Alphabet,
  basis: Basis,
  mode: NumericMode | undefined,
): Breakdown =>
  scoreText(text, alphabet, (letter) => {
    if (basis === "serial") return positionOf(letter, alphabet);
    if (basis === "column") return columnOf(letter, alphabet, mode);
    return numericOf(letter, alphabet, mode);
  });

const spreadOf = (
  text: string,
  alphabet: Alphabet,
  basis: "value" | "column",
): SpreadLine["modes"] => ({
  decompose: score(text, alphabet, basis, "decompose"),
  inherit: score(text, alphabet, basis, "inherit"),
  strict: score(text, alphabet, basis, "strict"),
});

const showSpread = (modes: SpreadLine["modes"], format: DerivationFormat): string => {
  const separator = format === "unicode" ? " · " : " . ";
  const body = numericModes
    .map((mode) => {
      const item = modes[mode];
      const shown = item.value === null ? gap(item.undefinedBy, format) : String(item.value);
      return `${modeMark(mode, format)} ${shown}`;
    })
    .join(separator);
  return `{ ${body} }`;
};

const relation = (
  basis: Basis,
  reduced: boolean,
  equal: boolean,
  format: DerivationFormat,
): string => {
  const sign = format === "unicode" ? (equal ? "≡" : "≢") : equal ? "=" : "!=";
  if (basis === "serial") {
    const serialMark = format === "unicode" ? "№" : "N";
    const one = reduced ? (format === "unicode" ? "₁" : "1") : "";
    return `${sign}${serialMark}${one}`;
  }
  const columnMark =
    basis === "column" ? (format === "unicode" ? "ₖ" : "k") : "";
  const one = reduced ? (format === "unicode" ? "₁" : "1") : "";
  return `${sign}#${columnMark}${one}`;
};

type State = {
  readonly alphabet: Alphabet | null;
  readonly lines: readonly Line[];
  readonly output: readonly string[];
};

const amountBody = (line: AmountLine, format: DerivationFormat): string => {
  if (line.amount === null) return gap(line.undefinedBy, format);
  if (line.reduced) return showTrace(line.trace, format);
  return showParts(line.parts, line.amount);
};

const apply = (state: State, step: DerivationStep, format: DerivationFormat): State => {
  if (step.op === "alphabet") {
    return {
      ...state,
      alphabet: step.alphabet,
      output: [...state.output, `alphabet ${mark(step.alphabet, format)}`],
    };
  }

  const alphabet = requireAlphabet(state.alphabet);
  const number = state.lines.length + 1;
  const push = (line: Line, body: string, because: string): State => ({
    ...state,
    lines: [...state.lines, line],
    output: [...state.output, row(number, body, because)],
  });

  if (step.op === "tokenize") {
    const tokenized = tokenize(step.text, alphabet);
    const line: WordLine = {
      kind: "word",
      text: step.text,
      alphabet,
      words: tokenized.value,
      undefinedBy: tokenized.undefinedBy,
    };
    const shown =
      tokenized.value === null
        ? gap(tokenized.undefinedBy, format)
        : sequence(tokenized.value, format);
    return push(line, `${wrap(step.text, alphabet, format)} = ${shown}`, "given; tokenize");
  }

  if (step.op === "value" || step.op === "column" || step.op === "serial") {
    const basis: Basis = step.op === "value" ? "value" : step.op === "column" ? "column" : "serial";
    const mode = step.op === "serial" ? undefined : step.mode;
    const source = requireWord(at(state.lines, step.line), step.line);
    const op = operator(basis, mode, false, format);
    const because =
      mode === "*" && basis === "value" ? "spread" : basis === "column" ? "column sum" : op;
    if (mode === "*") {
      if (basis === "serial") throw new Error("a serial value has no spread");
      const modes = spreadOf(source.text, source.alphabet, basis);
      const line: SpreadLine = { kind: "spread", basis, text: source.text, alphabet: source.alphabet, modes };
      return push(
        line,
        `${op}${wrap(source.text, source.alphabet, format)} = ${showSpread(modes, format)}`,
        `${because}, ${step.line}`,
      );
    }
    const scored = score(source.text, source.alphabet, basis, mode);
    const line: AmountLine = {
      kind: "amount",
      basis,
      reduced: false,
      ...(mode === undefined ? {} : { mode }),
      text: source.text,
      alphabet: source.alphabet,
      amount: scored.value,
      undefinedBy: scored.undefinedBy,
      parts: scored.parts,
      trace: [],
    };
    const shown = scored.value === null ? gap(scored.undefinedBy, format) : showParts(scored.parts, scored.value);
    return push(line, `${op}${wrap(source.text, source.alphabet, format)} = ${shown}`, `${because}, ${step.line}`);
  }

  if (step.op === "reduce") {
    const source = at(state.lines, step.line);
    if (source.kind !== "amount") throw new Error(`derivation line ${step.line} is not a single value`);
    const trace = source.amount === null ? [] : reduceTrace(source.amount);
    const line: AmountLine = {
      ...source,
      reduced: true,
      amount: trace.length === 0 ? null : (trace[trace.length - 1] ?? null),
      trace,
    };
    const op = operator(source.basis, source.mode, true, format);
    return push(
      line,
      `${op}${wrap(source.text, source.alphabet, format)} = ${amountBody(line, format)}`,
      `reduce, ${step.line}`,
    );
  }

  if (step.op === "cipher") {
    const source = requireWord(at(state.lines, step.line), step.line);
    const permuted = permute(source.text, step.cipher, { alphabet: source.alphabet });
    const tokenized = permuted.value === null ? null : tokenize(permuted.value, source.alphabet);
    const line: WordLine = {
      kind: "word",
      text: permuted.value ?? source.text,
      alphabet: source.alphabet,
      words: tokenized?.value ?? null,
      undefinedBy: permuted.undefinedBy,
    };
    const shown =
      permuted.value === null
        ? gap(permuted.undefinedBy, format)
        : wrap(permuted.value, source.alphabet, format);
    const because =
      step.cipher === "atbash"
        ? `atbash (i ${mapsTo(format)} ${alphabetSize(source.alphabet) + 1}${minus(format)}i)`
        : cipherLabel(step.cipher, format);
    return push(
      line,
      `${cipherLabel(step.cipher, format)} ${wrap(source.text, source.alphabet, format)} = ${shown}`,
      `${because}, ${step.line}`,
    );
  }

  if (step.op === "acronym") {
    const result = acronym(step.text, { alphabet });
    const tokenized = result.value === null ? null : tokenize(result.value, alphabet);
    const line: WordLine = {
      kind: "word",
      text: result.value ?? step.text,
      alphabet,
      words: tokenized?.value ?? null,
      undefinedBy: result.undefinedBy,
    };
    const arrowUp = format === "unicode" ? "↑" : "^";
    const shown = result.value === null ? gap(result.undefinedBy, format) : wrap(result.value, alphabet, format);
    return push(line, `${arrowUp}${wrap(step.text, alphabet, format)} = ${shown}`, "acronym");
  }

  if (step.op === "expand") {
    const result = expand(step.text, step.lexicon, { alphabet });
    const shown =
      result.value === null
        ? gap(result.undefinedBy, format)
        : result.value.length === 0
          ? format === "unicode"
            ? "∅"
            : "{}"
          : result.value.map((phrase) => wrap(phrase, alphabet, format)).join(` ${dot(format)} `);
    const arrowDown = format === "unicode" ? "↓" : "v";
    return push(
      { kind: "note" },
      `${arrowDown}[dict:${step.lexicon.name}]${wrap(step.text, alphabet, format)} = ${shown}`,
      `dict:${step.lexicon.name}`,
    );
  }

  if (step.op === "anagram") {
    const left = tokenize(step.left, alphabet);
    const right = tokenize(step.right, alphabet);
    const equal =
      left.value !== null &&
      right.value !== null &&
      [...left.value.flat()].sort().join("\u0000") === [...right.value.flat()].sort().join("\u0000");
    const symbol = format === "unicode" ? (equal ? "∼" : "≁") : equal ? "~" : "!~";
    return push(
      { kind: "note" },
      `${wrap(step.left, alphabet, format)} ${symbol} ${wrap(step.right, alphabet, format)}`,
      "anagram",
    );
  }

  const left = at(state.lines, step.left);
  const right = at(state.lines, step.right);
  const spread = left.kind === "spread" ? left : right.kind === "spread" ? right : null;
  const plain = left.kind === "amount" ? left : right.kind === "amount" ? right : null;
  if (spread !== null && plain !== null && spread.basis === step.by && plain.basis === step.by) {
    const matching = numericModes.filter((mode) => {
      const amount = spread.modes[mode].value;
      return plain.amount !== null && amount !== null && amount === plain.amount;
    });
    const clause =
      matching.length === 0 || matching.length === numericModes.length
        ? ""
        : ` under ${matching.map((mode) => modeMark(mode, format)).join(", ")}${matching.length === 1 ? " only" : ""}`;
    return push(
      { kind: "note" },
      `${wrap(left.kind === "note" ? "" : textOf(left), alphabetOf(left), format)} ${relation(step.by, false, matching.length > 0, format)} ${wrap(textOf(right), alphabetOf(right), format)}${clause}`,
      `${step.left}, ${step.right}`,
    );
  }

  if (left.kind === "amount" && right.kind === "amount") {
    const equal = left.amount !== null && left.amount === right.amount;
    const reduced = left.reduced && right.reduced;
    return push(
      { kind: "note" },
      `${wrap(left.text, left.alphabet, format)} ${relation(step.by, reduced, equal, format)} ${wrap(right.text, right.alphabet, format)}`,
      `${step.left}, ${step.right}`,
    );
  }

  throw new Error("derivation comparison needs two values");
};

const textOf = (line: Line): string => {
  if (line.kind === "word" || line.kind === "amount" || line.kind === "spread") return line.text;
  return "";
};

const alphabetOf = (line: Line): Alphabet => {
  if (line.kind === "word" || line.kind === "amount" || line.kind === "spread") return line.alphabet;
  throw new Error("derivation line has no alphabet");
};

export const derive = (
  steps: readonly DerivationStep[],
  options: { readonly format: DerivationFormat },
): string =>
  steps
    .reduce<State>((state, step) => apply(state, step, options.format), {
      alphabet: null,
      lines: [],
      output: [],
    })
    .output.join("\n");
