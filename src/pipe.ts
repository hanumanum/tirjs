export function pipe<T>(value: T): T;
export function pipe<T, A>(value: T, fn1: (input: T) => A): A;
export function pipe<T, A, B>(value: T, fn1: (input: T) => A, fn2: (input: A) => B): B;
export function pipe<T, A, B, C>(
  value: T,
  fn1: (input: T) => A,
  fn2: (input: A) => B,
  fn3: (input: B) => C,
): C;
export function pipe<T, A, B, C, D>(
  value: T,
  fn1: (input: T) => A,
  fn2: (input: A) => B,
  fn3: (input: B) => C,
  fn4: (input: C) => D,
): D;
export function pipe(
  value: unknown,
  ...fns: readonly ((input: unknown) => unknown)[]
): unknown {
  return fns.reduce((current, fn) => fn(current), value);
}
