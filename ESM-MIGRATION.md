# ESM Migration Plan (future work)

This document scopes what it would take to convert mochawesome from
CommonJS to native ES modules. It is **not** part of the v8 release — v8
stays CommonJS. This is a roadmap for a later major (v9+).

## Why bother

- Several runtime deps have gone ESM-only and are pinned to old majors
  purely because we still `require()`:
  - `diff` (pinned ^5; 8.x+ is ESM-only — and 6–8 carry a DoS advisory,
    so we are currently stuck on a CJS line with no in-range fix). This is
    now the _only_ runtime dependency held back by CJS: `chalk` and
    `strip-ansi` were removed in v8 in favor of `node:util` built-ins.
- ESM is the ecosystem default; staying CJS increasingly costs us security
  and feature updates.

## Blockers / cost (in rough order of effort)

1. **Test suite (largest cost).** Tests rely on `proxyquire` and
   `sinon` to swap dependencies (`uuid`/`crypto`, marge, mocha reporters,
   `./utils`). `proxyquire` is CJS-only and cannot intercept ESM imports.
   Options:
   - Switch to `esmock` (loader-based ESM mocking), or
   - Refactor to dependency injection so mocks are passed in rather than
     intercepted at module load, or
   - Use Node's built-in `module.register` / mock mechanisms.
     This is the bulk of the work and the main risk.

2. **JSON imports.** `mochawesome.js` reads `mocha/package.json`,
   `mochawesome-report-generator/package.json`, and `../package.json`.
   In ESM these need `import ... with { type: 'json' }` (stable in Node 22) or `createRequire(import.meta.url)`. `createRequire` is the
   lowest-risk path and also covers item 3.

3. **Deep mocha internals.** We import `mocha/lib/reporters/base`,
   `mocha/lib/reporters/<name>`, `mocha/lib/utils`,
   `mocha/lib/stats-collector`. These are not part of mocha's `exports`
   map for ESM, so direct `import` may fail. Use
   `createRequire(import.meta.url)` for these (keeps the existing
   resolution behavior) until/unless mocha exposes ESM entry points.

4. **Package entry points.** Decide dual-package vs pure ESM:
   - Pure ESM is cleaner but drops `require('mochawesome')` for consumers
     still on CJS — another breaking change.
   - A dual build (`exports` map with `import` + `require` conditions)
     preserves both at the cost of a build step (currently there is none;
     `main` points straight at `src/`).
     Recommendation: pure ESM for a major, since mocha itself supports
     loading ESM reporters and the audience is test tooling.

5. **Root re-export shims.** `addContext.js` and `register.js` at the repo
   root re-export from `src/`. These become `.mjs`/`"type":"module"` and
   must use `export` / `export default`. The published `exports` map (or
   `files`) must expose `./addContext` and `./register` subpaths.

6. **`crypto.randomUUID`.** Already migrated to a named import in v8
   (`const { randomUUID } = require('node:crypto')`) — in ESM this is just
   `import { randomUUID } from 'node:crypto'`. No extra work.

## Suggested sequence

1. Add `createRequire` usage for JSON + mocha deep imports (works in both
   CJS and ESM, de-risks items 2–3 first).
2. Replace `proxyquire` with `esmock` (or DI) while still CJS, proving the
   mocking strategy independently of the syntax flip.
3. Flip `"type": "module"`, convert `require`/`module.exports` to
   `import`/`export`, update the root shims and `exports` map.
4. Upgrade chalk 5, strip-ansi 7, diff 9 (the payoff).
5. Verify report JSON output is byte-for-byte unchanged against a v8
   baseline.

## Effort estimate

Roughly 1–2 days, dominated by the test-mocking rewrite (item 1). The
source itself is small and already free of `__dirname`/`var`/legacy
patterns, so the syntax conversion is mechanical.
