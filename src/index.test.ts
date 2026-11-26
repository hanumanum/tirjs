import { describe, expect, it } from "vitest";
import {
  err,
  letters,
  map,
  match,
  ok,
  permute,
  pipe,
  reduce,
  unwrapOr,
  value,
  valueAll,
} from "./index.js";

describe("public API", () => {
  it("composes pipe and result helpers", () => {
    const result = pipe(
      ok(20),
      (current) => map(current, (n) => n + 1),
      (current) => map(current, (n) => n * 2),
    );

    expect(result).toEqual(ok(42));
    expect(unwrapOr(result, 0)).toBe(42);
  });

  it("exposes err through the barrel", () => {
    expect(match(err("missing"), { ok: () => "ok", err: (error) => error })).toBe(
      "missing",
    );
  });

  it("evaluates TirN from the public API", () => {
    expect(letters("Հուր", { alphabet: "G" })).toEqual({
      value: ["Հ", "Ո", "Ւ", "Ր"],
      undefinedBy: [],
    });
    expect(value("Հայկ", { alphabet: "G" }).value).toBe(431);
    expect(reduce(431)).toBe(8);
    expect(permute("Հայկ", "atbash", { alphabet: "G" }).value).toBe("ՅՔՀՆ");
    expect(valueAll("Հուր", { alphabet: "A" }).strict).toEqual({
      value: null,
      undefinedBy: ["Ու"],
    });
  });
});
