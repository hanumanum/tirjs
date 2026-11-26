import { describe, expect, it } from "vitest";
import { err, map, match, ok, pipe, unwrapOr } from "./index.js";

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
});
