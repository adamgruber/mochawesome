# Agent Guidance (mochawesome)

This repo contains two codebases:

## v7 (legacy)

- Lives at repo root: /src, /test, register.js, etc.
- Must NOT be modified as part of v8 work.
- Consider it frozen except for critical maintenance.

## v8 (rewrite)

- All new work lives under: /packages/mochawesome
- Language: TypeScript
- Tests: vitest
- Validation: AJV 2020-12
- CI runs tests from /packages/mochawesome only
- Root-level tests/scripts are legacy (v7) and must not be touched

## Current v8 principles

- JSON schema is the contract. Do not change it lightly.
- Deterministic behavior over convenience.
- No randomness (IDs, timestamps, ordering).
- Prefer small, test-backed commits.
- Internal modularity is for maintainers, not users.

## ID strategy (v8)

- Path-based, deterministic:
  - suites: s0, s0.1, s0.1.2
  - tests: t0.1.2.1
  - hooks: h0.1.2.1
- Assigned by traversal/build order.

## Non-goals (for now)

- No additional test runner integrations beyond Mocha unless explicitly requested
- Renderer work will come after schema + data model stabilize
- CLI behavior will follow schema decisions, not lead them
- No refactors of v7 code

When unsure, ask before expanding scope.
