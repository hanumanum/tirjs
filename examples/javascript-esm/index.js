import assert from "node:assert/strict";
import { test } from "node:test";
import {
  columnSum,
  letters,
  map,
  ok,
  permute,
  pipe,
  reduce,
  serial,
  value,
  valueAll,
} from "tirjs";

test("plain ESM JavaScript can evaluate TirN", () => {
  assert.deepEqual(letters("Հուր", { alphabet: "G" }), {
    value: ["Հ", "Ո", "Ւ", "Ր"],
    undefinedBy: [],
  });
  assert.equal(value("Հայկ", { alphabet: "G" }).value, 431);
  assert.equal(reduce(431), 8);
  assert.equal(permute("Հայկ", "atbash", { alphabet: "G" }).value, "ՅՔՀՆ");
  const split = permute("ՓԺ", "atbash", { alphabet: "A" });
  assert.deepEqual(split.letters, [["Ե", "Վ"]]);
  assert.equal(serial(split, { alphabet: "A" }).value, 35);
  assert.equal(permute(split, "atbash", { alphabet: "A" }).value, "ՓԺ");
  assert.equal(columnSum("ՅՔՀՆ", { alphabet: "G" }).value, 23);
  assert.deepEqual(valueAll("Հուր", { alphabet: "A" }).strict, {
    value: null,
    undefinedBy: ["Ու"],
  });
});

test("plain ESM JavaScript can call pipe", () => {
  const result = pipe(
    ok(20),
    (current) => map(current, (n) => n + 1),
    (current) => map(current, (n) => n * 2),
  );

  assert.deepEqual(result, ok(42));
});
