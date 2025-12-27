# mochawesome v8 plan

## Status

Active rewrite on branch `next`.

## Goals

- Modernize mochawesome while preserving its core value:
  a high-quality, offline-capable HTML report for Mocha.
- Reduce maintenance burden and release complexity.
- Establish a stable, explicit JSON report contract.

## Non-goals (for v8 initial releases)

- Supporting non-Mocha runners (e.g. Jest).
- Rewriting or refactoring v7 code.
- Feature parity with every v7 edge case on day one.

## Key decisions

- Package name remains `mochawesome`.
- Reporter and renderer are bundled into a single package.
- JSON schema is the primary contract; HTML is a view of it.
- Deterministic, path-based IDs are used (no UUIDs).
- v8 will ship behind the `next` dist-tag until stable.

## Architecture overview

- `/packages/mochawesome` contains all v8 code.
- Legacy v7 code remains at repo root and is considered frozen.
- Internal modules (core, reporter, renderer) are for maintainers,
  not separate published packages.

## Release strategy

- v7 continues on `master`.
- v8 work happens on `next`.
- Early releases: `mochawesome@next` (alpha/beta).
- Promotion to `latest` once v8 stabilizes.

## Migration philosophy

- Avoid breaking user workflows unnecessarily.
- Preserve default filenames and directory layout where reasonable.
- Document intentional breaking changes clearly.
