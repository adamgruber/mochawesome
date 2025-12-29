import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, it, expect } from 'vitest';
import schema from '../src/schema/mochawesome-report-8.schema.json';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema as any);

describe('mocha integration', () => {
  it('writes a v8 report json that validates', () => {
    const pkgRoot = path.resolve(__dirname, '..'); // packages/mochawesome
    const mochaBin = require.resolve('mocha/bin/mocha', {
      paths: [pkgRoot],
    });
    const fixture = path.join(__dirname, 'fixtures', 'mocha', 'basic.spec.js');
    const reportDirName = `.tmp-mochawesome-${Date.now()}`;
    const reportDir = path.join(pkgRoot, reportDirName);
    const reporterCjs = path.join(__dirname, 'support', 'reporter.cjs');

    const runMocha = () => {
      const res = spawnSync(
        process.execPath,
        [
          mochaBin,
          '--reporter',
          reporterCjs,
          '--reporter-option',
          `reportDir=${reportDirName}`,
          '--',
          fixture,
        ],
        {
          cwd: pkgRoot,
          env: {
            ...process.env,
            // keep it simple and compatible with Mocha's CJS execution
            TS_NODE_TRANSPILE_ONLY: '1',
            TS_NODE_COMPILER_OPTIONS: JSON.stringify({
              module: 'CommonJS',
            }),
          },
          encoding: 'utf8',
        }
      );
      const stdout = res.stdout ? String(res.stdout) : '';
      const stderr = res.stderr ? String(res.stderr) : '';

      if (res.error) {
        throw new Error(
          `mocha spawn failed: ${String(
            res.error
          )}\nstdout:\n${stdout}\nstderr:\n${stderr}`
        );
      }

      // Mocha exits 1 when the fixture has failing tests.
      // We validate behavior via the generated report instead.
      if (res.status !== 0 && res.status !== 1) {
        throw new Error(
          `mocha run failed (exit ${res.status})\nstdout:\n${stdout}\nstderr:\n${stderr}`
        );
      }
    };

    try {
      runMocha();

      const outPath = path.join(reportDir, 'mochawesome.json');
      expect(fs.existsSync(outPath)).toBe(true);

      const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      const ok = validate(report);
      if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));

      // Suite tree assertions
      expect(report.rootSuite.suites.length).toBe(1);
      expect(report.rootSuite.suites[0].id).toBe('s0.1');
      expect(report.rootSuite.suites[0].title).toBe('outer');

      expect(report.rootSuite.suites[0].suites.length).toBe(1);
      expect(report.rootSuite.suites[0].suites[0].id).toBe('s0.1.1');
      expect(report.rootSuite.suites[0].suites[0].title).toBe('inner');

      // Test tree assertions
      const inner = report.rootSuite.suites[0].suites[0];
      expect(inner.tests.length).toBe(3);

      expect(inner.tests[0].id).toBe('t0.1.1.1');
      expect(inner.tests[0].state).toBe('passed');

      expect(inner.tests[1].id).toBe('t0.1.1.2');
      expect(inner.tests[1].state).toBe('failed');
      expect(inner.tests[1].error?.message).toBe('boom');

      expect(inner.tests[2].id).toBe('t0.1.1.3');
      expect(inner.tests[2].state).toBe('pending');

      // Report stats assertions
      expect(report.stats.tests).toBe(3);
      expect(report.stats.passes).toBe(1);
      expect(report.stats.failures).toBe(1);
      expect(report.stats.pending).toBe(1);
    } finally {
      // best-effort cleanup
      fs.rmSync(reportDir, { recursive: true, force: true });
    }
  });
});
