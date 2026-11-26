# tirjs

Functional library written in TypeScript. Plain JavaScript can call it with `import` or `require`.

## Install

```bash
npm install tirjs
```

## JavaScript

ESM:

```javascript
import { map, ok } from "tirjs";

const result = map(ok(2), (n) => n + 1);
```

CommonJS:

```javascript
const { map, ok } = require("tirjs");
```

## TypeScript

```typescript
import { err, ok, unwrapOr, type Result } from "tirjs";

const lengthOf = (text: string): Result<number, "empty"> =>
  text.length === 0 ? err("empty") : ok(text.length);

unwrapOr(lengthOf("abcd"), 0);
```

`Result` is a plain object, `{ ok: true, value }` or `{ ok: false, error }`. Functions return a new result and leave their arguments unchanged. `pipe` threads a value through small functions.

## Develop

```bash
npm install
npm install --prefix examples/javascript-esm
npm install --prefix examples/javascript-cjs
npm test
npm run check
```

`npm test` runs one Vitest file per module in `src/`. `npm run check` also typechecks, builds ESM and CommonJS into `dist/`, and runs the plain JavaScript examples.

Add behavior test-first. Write `src/<name>.test.ts`, run `npm test` and see the new test fail, then add `src/<name>.ts` and export it from `src/index.ts`. Each iteration ends with `npm test` passing, and with `README.md` plus the other docs updated to match the change.

## Layout

```
src/                 TypeScript source and module tests
examples/            Plain JavaScript clients
dist/                ESM, CommonJS, and .d.ts (build output)
.cursor/rules/       Project rules: functional style, JavaScript clients, module tests, test-first work, and the iteration close
```
