# Report-output parity gate

A regression gate for the reporter's **output contract**. It runs a fixed
fixture suite through the local reporter (serial and parallel), normalizes
the generated JSON, and compares it against committed golden snapshots.
Any change to the report shape or content shows up as a reviewable diff.

This complements the unit tests: unit tests check internal functions;
this checks the actual emitted report end-to-end, the same thing a
consumer (e.g. Cypress, marge) sees.

## Running

```bash
npm run test:parity          # verify against golden snapshots (exit 1 on mismatch)
npm run test:parity:update   # regenerate snapshots after an intentional change
```

It also runs automatically as part of `npm test`, so it is enforced in CI
(across every Node version in the matrix) and at publish time (via
`prepack` → `npm test`).

## When the gate fails

The output changed. Two cases:

- **Unintended** — a regression. Fix the code until the gate passes.
- **Intended** — you deliberately changed the report. Run
  `npm run test:parity:update`, eyeball the golden diff, and commit it so
  the change is documented in the PR.

## How it works

- `fixtures/` — a deterministic suite (pass / fail-with-diff / pending /
  nested / hooks / `addContext`). The failing tests throw hand-built
  errors so the output does not depend on Node's assertion-message text.
- `normalize.js` — replaces values that legitimately vary between runs
  (UUIDs, durations, timestamps, absolute paths) and stack frames (which
  differ by Node version) with stable placeholders, then sorts keys and
  parallel-mode suite ordering for a deterministic snapshot.
- `golden/` — the committed expected output, one file per scenario.

## Comparing against a published version

The same fixtures + normalizer can double as a "next vs last published"
check: `npm pack` the branch, install it and the previous npm release into
two temp projects, run the fixtures through each, and diff the normalized
JSON. The committed golden makes this unnecessary for routine work — the
golden _is_ the recorded baseline — but it's useful as a one-off sanity
check before a major release.
