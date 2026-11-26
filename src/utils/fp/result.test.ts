import { describe, expect, it } from "vitest";
import {
  err,
  flatMap,
  isErr,
  isOk,
  map,
  mapError,
  match,
  ok,
  unwrapOr,
} from "./result.js";

describe("ok and err", () => {
  it("builds an ok value", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
  });

  it("builds an err value", () => {
    expect(err("missing")).toEqual({ ok: false, error: "missing" });
  });
});

describe("isOk and isErr", () => {
  it("distinguishes the two cases", () => {
    expect(isOk(ok("yes"))).toBe(true);
    expect(isErr(ok("yes"))).toBe(false);
    expect(isOk(err("no"))).toBe(false);
    expect(isErr(err("no"))).toBe(true);
  });
});

describe("map", () => {
  it("applies the function to an ok value", () => {
    expect(map(ok(2), (n) => n + 1)).toEqual(ok(3));
  });

  it("leaves an err value untouched", () => {
    const failure = err("nope");
    expect(map(failure, (n: number) => n + 1)).toBe(failure);
  });

  it("does not mutate the input value", () => {
    const user = { name: "Ada" };
    const renamed = map(ok(user), (current) => ({ ...current, name: "Grace" }));

    expect(user).toEqual({ name: "Ada" });
    expect(renamed).toEqual(ok({ name: "Grace" }));
  });
});

describe("mapError", () => {
  it("transforms an err value", () => {
    expect(mapError(err("missing"), (error) => error.length)).toEqual(err(7));
  });

  it("leaves an ok value untouched", () => {
    const success = ok(4);
    expect(mapError(success, (error: string) => error.length)).toBe(success);
  });
});

describe("flatMap", () => {
  const parse = (text: string) =>
    text.length === 0 ? err("empty" as const) : ok(text.length);

  it("chains another result", () => {
    expect(flatMap(ok("abcd"), parse)).toEqual(ok(4));
  });

  it("short-circuits on err", () => {
    const failure = err("missing" as const);
    expect(flatMap(failure, parse)).toBe(failure);
  });

  it("keeps an error returned by the function", () => {
    expect(flatMap(ok(""), parse)).toEqual(err("empty"));
  });
});

describe("unwrapOr", () => {
  it("returns the ok value", () => {
    expect(unwrapOr(ok(5), 0)).toBe(5);
  });

  it("returns the fallback for err", () => {
    expect(unwrapOr(err("missing"), 0)).toBe(0);
  });
});

describe("match", () => {
  it("runs the ok arm", () => {
    expect(match(ok(3), { ok: (value) => value * 2, err: () => 0 })).toBe(6);
  });

  it("runs the err arm", () => {
    expect(
      match(err("missing"), {
        ok: (value: number) => `n=${value}`,
        err: (error) => error,
      }),
    ).toBe("missing");
  });
});
