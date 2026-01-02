import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import schema from '../src/schema/mochawesome-report-8.schema.json';
import {
  addHook,
  addSuite,
  addTest,
  createReport,
  createRootSuite,
} from '../src/core/model';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

describe('model builder', () => {
  it('builds a deterministic report that matches the schema', () => {
    const start = '2024-01-01T00:00:00.000Z';
    const timing = { start, end: start, durationMs: 0 };

    const rootSuite = createRootSuite({
      title: '',
      fullTitle: '',
      timing,
    });

    const suiteA = addSuite(rootSuite, {
      title: 'Suite A',
      fullTitle: 'Suite A',
      timing,
    });

    addSuite(suiteA, {
      title: 'Suite B',
      fullTitle: 'Suite A Suite B',
      timing,
    });

    const suiteC = addSuite(suiteA, {
      title: 'Suite C',
      fullTitle: 'Suite A Suite C',
      timing,
    });

    addTest(suiteC, {
      title: 'does a thing',
      fullTitle: 'Suite A Suite C does a thing',
      state: 'passed',
      timing,
    });

    addHook(suiteC, {
      type: 'beforeEach',
      title: 'before each',
      state: 'passed',
      timing,
    });

    const report = createReport({
      schemaVersion: '8.0.0-alpha.0',
      meta: {
        generatedAt: start,
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
        suites: 3,
        tests: 1,
        passes: 1,
        failures: 0,
        pending: 0,
        skipped: 0,
        start,
        end: start,
        durationMs: 0,
      },
      rootSuite,
    });

    expect(rootSuite.id).toBe('s0');
    expect(suiteA.id).toBe('s0.1');
    expect(suiteC.id).toBe('s0.1.2');
    expect(suiteC.tests[0]?.id).toBe('t0.1.2.1');
    expect(suiteC.hooks[0]?.id).toBe('h0.1.2.1');

    const ok = validate(report);
    if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));
  });
});
