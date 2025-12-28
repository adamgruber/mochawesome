import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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

    try {
      const runMocha = () => {
        try {
          execFileSync(
            process.execPath,
            [
              mochaBin,
              fixture,
              '--reporter',
              reporterCjs,
              '--reporter-option',
              `reportDir=${reportDirName}`,
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
        } catch (error: any) {
          const stdout = error?.stdout ? String(error.stdout) : '';
          const stderr = error?.stderr ? String(error.stderr) : '';
          const code = error?.status ?? 'unknown';
          throw new Error(
            `mocha run failed (exit ${code})\nstdout:\n${stdout}\nstderr:\n${stderr}`
          );
        }
      };

      runMocha();

      const outPath = path.join(reportDir, 'mochawesome.json');
      if (!fs.existsSync(outPath)) {
        const files = fs.existsSync(reportDir) ? fs.readdirSync(reportDir) : [];
        throw new Error(
          `mochawesome.json missing. files in reportDir: ${files.join(', ')}`
        );
      }

      expect(fs.existsSync(outPath)).toBe(true);

      const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      const ok = validate(report);
      if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));

      // Suite tree assertions (suites-only wiring)
      expect(report.rootSuite.suites.length).toBe(1);
      expect(report.rootSuite.suites[0].id).toBe('s0.1');
      expect(report.rootSuite.suites[0].title).toBe('outer');

      expect(report.rootSuite.suites[0].suites.length).toBe(1);
      expect(report.rootSuite.suites[0].suites[0].id).toBe('s0.1.1');
      expect(report.rootSuite.suites[0].suites[0].title).toBe('inner');
    } finally {
      // best-effort cleanup
      fs.rmSync(reportDir, { recursive: true, force: true });
    }
  });
});
