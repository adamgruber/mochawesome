# Legacy v7 (`types.js`) → v8 Schema Mapping

## Top-level

| Legacy v7 (`TestReport`) | v8 schema | Notes |
|---|---|---|
| `stats` | `stats` | Different shape; v8 drops derived percentages and “other” counters; adds `durationMs` and optional `failuresByType`. |
| `results: Suite[]` | `rootSuite: Suite` | v8 is a single rooted tree; legacy uses a forest list. |
| `meta?: { mocha, mochawesome, marge }` | `meta: { runner, reporter, output, generatedAt, durationMs, ... }` | v8 meta is provenance + output; legacy meta is tool-specific options/version buckets. |
| *(none)* | `schema: { name, version }` | New explicit schema marker. |
| *(none)* | `environment?`, `files?`, `warnings?` | New optional top-level fields in v8. |

## Stats

| Legacy v7 `stats` | v8 `stats` | Notes |
|---|---|---|
| `suites, tests, passes, pending, failures, skipped` | `suites, tests, passes, pending, failures, skipped` | Same core counters. In v8, `failures` can be total (tests + hooks). |
| `start, end` (ISO strings) | `start, end` (date-time) | Same meaning; v8 adds strict JSON Schema format. |
| `duration` (maybe int) | `durationMs` (int, required) | v8 makes duration required and explicitly milliseconds. |
| `testsRegistered` | *(none)* | Legacy-specific; if needed later, can live in `meta` or `stats.extra`. |
| `passPercent, pendingPercent` | *(none)* | Prefer deriving in renderer; avoid storing derived values. |
| `other, hasOther, hasSkipped` | *(none)* | Legacy “other” bucket removed; v8 uses explicit states. |
| *(none)* | `failuresByType?: { tests, hooks }` | New; supports HTML breakdown without tree scanning (optional). |

## Suite

| Legacy v7 `Suite` | v8 `suite` | Notes |
|---|---|---|
| `uuid` / `parentUUID` | `id` / `stableKey?` | v8 uses deterministic path IDs; `stableKey` can later support stable cross-run identity. |
| `title` | `title` | Same. |
| *(computed)* | `fullTitle` | v8 requires `fullTitle` on suites. |
| `file`, `fullFile` | `file?` | v8 keeps a single optional `file`. |
| `suites: Suite[]` | `suites: Suite[]` | Same nesting concept. |
| `tests: Test[]` | `tests: Test[]` | Same concept, different test shape. |
| `beforeHooks/afterHooks` | `hooks: Hook[]` | Hooks are first-class in v8. |
| `passes/failures/pending/skipped: UUID[]` | *(none)* | Redundant in legacy; v8 derives from state fields. |
| `duration` | `timing` | v8 normalizes timing. |
| Mocha internals | *(none)* | Removed; use `extra` if needed. |

## Test

| Legacy v7 `Test` | v8 `test` | Notes |
|---|---|---|
| `uuid` / `parentUUID` | `id` / `stableKey?` | Deterministic IDs in v8. |
| `title`, `fullTitle` | `title`, `fullTitle` | Same. |
| `duration` | `timing.durationMs` | v8 requires full timing object. |
| `state?` + booleans | `state` | Single canonical state in v8. |
| `err: Object` | `error` | Normalized error shape. |
| `isHook` | *(none)* | Hooks are separate nodes. |

## Hook

| Legacy v7 | v8 `hook` | Notes |
|---|---|---|
| Hook as Test (`isHook`) | `hooks[]` | First-class hook nodes. |
| Implicit type in title | `type` enum | Explicit hook type in v8. |

## Migration Notes

v8 is a new contract. Legacy fields that are redundant, derived, or Mocha-internal are intentionally dropped. Migration should be handled via transforms or compatibility layers, not by polluting the v8 schema.
