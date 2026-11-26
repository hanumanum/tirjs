import assert from "node:assert/strict";
import { test } from "node:test";
import { err, map, match, ok, pipe } from "tirjs";

test("plain ESM JavaScript can call tirjs", () => {
  const result = pipe(
    ok(20),
    (current) => map(current, (n) => n + 1),
    (current) => map(current, (n) => n * 2),
  );

  assert.deepEqual(
    match(result, {
      ok: (value) => ({ status: "ok", value }),
      err: (error) => ({ status: "err", error }),
    }),
    { status: "ok", value: 42 },
  );

  assert.equal(
    match(err("missing"), {
      ok: (value) => value,
      err: (error) => error,
    }),
    "missing",
  );
});
