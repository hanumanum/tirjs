const digitSum = (n: number): number =>
  [...String(n)].reduce((sum, digit) => sum + Number(digit), 0);

const traceFrom = (current: number, trace: readonly number[]): readonly number[] => {
  if (current <= 9) return trace;
  const next = digitSum(current);
  return traceFrom(next, [...trace, next]);
};

export const reduceTrace = (n: number): readonly number[] => {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("reduce expects a non-negative integer");
  }
  return traceFrom(n, [n]);
};

export const reduce = (n: number): number => {
  const trace = reduceTrace(n);
  return trace[trace.length - 1] ?? 0;
};
