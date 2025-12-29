import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, it, expect } from 'vitest';
import schema from '../src/schema/mochawesome-report-8.schema.json';
import { Report } from '../src/core/model';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema as any);

const pkgRoot = path.resolve(__dirname, '..'); // packages/mochawesome
const mochaBin = require.resolve('mocha/bin/mocha', {
  paths: [pkgRoot],
});

const reporterCjs = path.join(__dirname, 'support', 'reporter.cjs');

function runMocha(fixtureFile: string, mochaArgs: string[] = []): Report {
  const reportDirName = `.tmp-mochawesome-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const reportDir = path.join(pkgRoot, reportDirName);
  const fixture = path.join(__dirname, 'fixtures', 'mocha', fixtureFile);

  try {
    const res = spawnSync(
      process.execPath,
      [
        mochaBin,
        ...mochaArgs,
        '--reporter',
        reporterCjs,
        '--reporter-option',
        `reportDir=${reportDir}`,
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
        stdio: 'inherit',
        // encoding: 'utf8',
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

    const outPath = path.join(reportDir, 'mochawesome.json');
    const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    const ok = validate(report);
    if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));
    return report as Report;
  } finally {
    fs.rmSync(reportDir, { recursive: true, force: true });
  }
}

describe('mocha integration', () => {
  it('basic fixture', () => {
    const report = runMocha('basic.spec.js');

    // Suite tree assertions
    expect(report.rootSuite.suites.length).toBe(1);
    expect(report.rootSuite.suites[0].id).toBe('s0.1');
    expect(report.rootSuite.suites[0].title).toBe('outer');
    expect(report.rootSuite.suites[0].suites.length).toBe(1);
    expect(report.rootSuite.suites[0].suites[0].id).toBe('s0.1.1');
    expect(report.rootSuite.suites[0].suites[0].title).toBe('inner');

    const inner = report.rootSuite.suites[0].suites[0];

    // Hooks assertions
    expect(inner.hooks.length).toBe(1);
    expect(inner.hooks[0].type).toBe('before');
    expect(inner.hooks[0].state).toBe('passed');

    // Test tree assertions
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
    expect(report.stats.failuresByType).toEqual({ tests: 1, hooks: 0 });
    expect(report.stats.pending).toBe(1);
  });

  it('hook-fail fixture', () => {
    const report = runMocha('hook-fail.spec.js');

    // Suite tree assertions
    expect(report.rootSuite.suites.length).toBe(1);
    expect(report.rootSuite.suites[0].id).toBe('s0.1');
    expect(report.rootSuite.suites[0].title).toBe('outer');
    expect(report.rootSuite.suites[0].suites.length).toBe(1);
    expect(report.rootSuite.suites[0].suites[0].id).toBe('s0.1.1');
    expect(report.rootSuite.suites[0].suites[0].title).toBe('inner');

    const inner = report.rootSuite.suites[0].suites[0];

    // Hooks assertions
    expect(inner.hooks.length).toBe(1);
    expect(inner.hooks[0].type).toBe('before');
    expect(inner.hooks[0].state).toBe('failed');
    expect(inner.hooks[0].error?.message).toBe('hook boom');

    // Test tree assertions
    expect(inner.tests.length).toBe(0);

    // Report stats assertions
    expect(report.stats.tests).toBe(0);
    expect(report.stats.passes).toBe(0);
    expect(report.stats.failures).toBe(1);
    expect(report.stats.failuresByType).toEqual({ tests: 0, hooks: 1 });
    expect(report.stats.pending).toBe(0);
  });

  it('retries fixture', () => {
    const report = runMocha('retry.spec.js');
    const inner = report.rootSuite.suites[0].suites[0];
    const flaky = inner.tests.find((t: any) => t.title === 'flaky');
    expect(flaky).toBeTruthy();

    expect(flaky?.state).toBe('passed');
    expect(flaky?.attempt).toBeTruthy();
    expect(flaky?.attempt?.current).toBe(2);
    expect(flaky?.attempt?.total).toBe(3);
    expect(flaky?.attempt?.retry).toBe(true);

    // Ensure retries didn't inflate test count (this fixture has exactly 1 test)
    expect(report.stats.tests).toBe(1);
    expect(report.stats.passes).toBe(1);
    expect(report.stats.failuresByType?.tests ?? report.stats.failures).toBe(0);
  });

  it('bail fixture: emits warning and counts executed tests only', () => {
    const report = runMocha('bail.spec.js', ['--bail']);
    const inner = report.rootSuite.suites[0].suites[0];

    expect(inner.tests.length).toBe(1);
    expect(inner.tests[0].state).toBe('failed');
    expect(report.stats.tests).toBe(1);
    expect(report.stats.failures).toBe(1);

    expect(report.warnings?.length).toBeGreaterThan(0);
    expect(report.warnings?.[0]).toMatch(/ended early/i);
  });
});
