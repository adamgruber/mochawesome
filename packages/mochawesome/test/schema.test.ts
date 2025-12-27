import Ajv from 'ajv';
import schema from '../src/schema/mochawesome-report-8.schema.json';

describe('mochawesome v8 schema', () => {
  it('accepts a minimal valid report', () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema as any);

    const report = {
      schema: { name: 'mochawesome-report', version: '8.0.0-alpha.0' },
      meta: {
        generatedAt: new Date().toISOString(),
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
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        durationMs: 0,
      },
      rootSuite: {
        id: 's0',
        title: '',
        fullTitle: '',
        timing: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          durationMs: 0,
        },
        suites: [],
        tests: [],
        hooks: [],
      },
    };

    const ok = validate(report);
    if (!ok) {
      throw new Error(JSON.stringify(validate.errors, null, 2));
    }
  });
});
