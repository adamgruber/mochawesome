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
