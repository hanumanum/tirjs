const assert = require("node:assert/strict");
const { test } = require("node:test");
const { columnSum, letters, map, ok, permute, pipe, reduce, serial, valueAll } = require("tirjs");

test("plain CommonJS JavaScript can evaluate TirN", () => {
  assert.deepEqual(letters("Հուր", { alphabet: "G" }), {
    value: ["Հ", "Ո", "Ւ", "Ր"],
    undefinedBy: [],
  });
  assert.equal(valueAll("Հուր", { alphabet: "A" }).decompose.value, 12670);
  assert.equal(reduce(valueAll("Հուր", { alphabet: "G" }).decompose.value), 7);
  assert.equal(permute("Հայկ", "atbash", { alphabet: "A" }).value, "ՈՖՃՉ");
  const split = permute("ՓԺ", "atbash", { alphabet: "A" });
  assert.deepEqual(split.letters, [["Ե", "Վ"]]);
  assert.equal(serial(split, { alphabet: "A" }).value, 35);
  assert.equal(permute(split, "atbash", { alphabet: "A" }).value, "ՓԺ");
  assert.equal(columnSum("Հայկ", { alphabet: "G" }).value, 17);
});

test("plain CommonJS JavaScript can call pipe", () => {
  const result = pipe(
    ok(20),
    (current) => map(current, (n) => n + 1),
    (current) => map(current, (n) => n * 2),
  );

  assert.deepEqual(result, ok(42));
});
