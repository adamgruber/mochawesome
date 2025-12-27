import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, it } from 'vitest';
import schema from '../src/schema/mochawesome-report-8.schema.json';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema as any);

describe('mochawesome v8 schema', () => {
  it('accepts a minimal valid report', () => {
    const now = new Date().toISOString();

    const report = {
      schema: { name: 'mochawesome-report', version: '8.0.0-alpha.0' },
      meta: {
        generatedAt: now,
        durationMs: 0,
        runner: { name: 'mocha', version: '0.0.0' },
        reporter: { name: 'mochawesome', version: '8.0.0-alpha.0' },
        output: {
          reportDir: 'mochawesome-report',
          htmlFile: 'mochawesome.html',
          jsonFile: 'mochawesome.json',
          assetsDir: 'assets',
          assetMode: 'inline',
          attachmentMode: 'link',
        },
      },
      stats: {
        suites: 0,
        tests: 0,
        passes: 0,
        failures: 0,
        pending: 0,
        skipped: 0,
        start: now,
        end: now,
        durationMs: 0,
      },
      rootSuite: {
        id: 's0',
        title: '',
        fullTitle: '',
        timing: { start: now, end: now, durationMs: 0 },
        suites: [],
        tests: [],
        hooks: [],
      },
    };

    const ok = validate(report);
    if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));
  });
});
