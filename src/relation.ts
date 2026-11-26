import { type Defined, type TextOptions, type ValueOptions } from "./alphabet.js";
import { columnSum } from "./column.js";
import { letters } from "./letters.js";
import { serial } from "./serial.js";
import { value } from "./value.js";

const unique = (items: readonly string[]): readonly string[] =>
  items.filter((item, index) => items.indexOf(item) === index);

const multiset = (items: readonly string[]): string => [...items].sort().join("\u0000");

const compare = (
  left: Defined<number>,
  right: Defined<number>,
): Defined<boolean> => {
  if (left.value === null || right.value === null) {
    return { value: null, undefinedBy: unique([...left.undefinedBy, ...right.undefinedBy]) };
  }
  return { value: left.value === right.value, undefinedBy: [] };
};

export const isAnagram = (
  left: string,
  right: string,
  options: TextOptions,
): Defined<boolean> => {
  const a = letters(left, options);
  const b = letters(right, options);
  if (a.value === null || b.value === null) {
    return { value: null, undefinedBy: unique([...a.undefinedBy, ...b.undefinedBy]) };
  }
  return { value: multiset(a.value) === multiset(b.value), undefinedBy: [] };
};

export const sameValue = (
  left: string,
  right: string,
  options: ValueOptions,
): Defined<boolean> => compare(value(left, options), value(right, options));

export const sameColumnSum = (
  left: string,
  right: string,
  options: ValueOptions,
): Defined<boolean> => compare(columnSum(left, options), columnSum(right, options));

export const sameSerial = (
  left: string,
  right: string,
  options: TextOptions,
): Defined<boolean> => compare(serial(left, options), serial(right, options));
