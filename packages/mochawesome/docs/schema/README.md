# mochawesome v8 report schema

This directory documents the **authoritative JSON schema** used by mochawesome v8.

The schema itself lives in the codebase at: `packages/mochawesome/src/schema/mochawesome-report-8.schema.json`

That file is the single source of truth for the v8 report contract between:

- the Mocha reporter
- the HTML renderer
- external consumers of mochawesome JSON output

## Schema location

- `mochawesome-report-8.schema.json`

## Versioning

- Schema version is embedded in every report:
  ```json
  {
    "schema": {
      "name": "mochawesome-report",
      "version": "8.x.x"
    }
  }
  ```

## Skip vs Pending Semantics

Mochawesome v8 distinguishes **pending** and **skipped** tests to preserve user intent while remaining compatible with Mocha’s event model.

### Definitions

- **pending**

  - A test that is declared but not implemented.
  - Example:
    ```js
    it('not implemented');
    ```
  - Meaning: a TODO / placeholder.
  - Counted as `pending`.

- **skipped**
  - A test that is explicitly skipped or not executed by design.
  - Examples:
    ```js
    it.skip('skipped');
    describe.skip('suite', () => {});
    it('skipped at runtime', function () {
      this.skip();
    });
    ```
  - Meaning: intentionally not run.
  - Counted as `skipped`.

### Mocha limitations

Mocha does **not reliably distinguish** between:

- `it.skip('name')`
- declared-pending tests (`it('name')`)

in all reporter events, especially in:

- parallel mode
- serialized runner payloads

Because of this:

- Mochawesome performs **best-effort classification** between `pending` and `skipped`.
- Some `it.skip()` cases may appear as `pending` at the node level.
- **Aggregate stats are authoritative**:
  - `pending + skipped` reflects all non-executed tests.
  - Runtime skips (`this.skip()`) are always counted as `skipped`.

### Filtering (`only`, `grep`)

- Tests excluded by `--grep`, `--only`, or similar filters:
  - **Do not appear in the report**
  - Are **not counted** as skipped or pending
- This matches mochawesome v7 behavior.

### Summary

| Scenario                    | State     | Included in report |
| --------------------------- | --------- | ------------------ |
| `it('todo')`                | pending   | yes                |
| `it.skip('x')`              | skipped\* | yes                |
| `this.skip()`               | skipped   | yes                |
| `describe.skip(...)`        | skipped   | yes                |
| filtered by `only` / `grep` | —         | no                 |

\* may appear as `pending` in some Mocha payloads; aggregate stats remain correct.
