import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, it, expect } from 'vitest';
import schema from '../src/schema/mochawesome-report-8.schema.json';
import type {
  Hook as HookModel,
  Report,
  Suite as SuiteModel,
  Test as TestModel,
} from '../src/core/model';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const pkgRoot = path.resolve(__dirname, '..'); // packages/mochawesome
const mochaBin = require.resolve('mocha/bin/mocha', {
  paths: [pkgRoot],
});
const registerPath = path.join(pkgRoot, 'register.cjs');
const reporterCjs = path.join(__dirname, 'support', 'reporter.cjs');

const getOuterSuite = (report: Report, index = 0) =>
  report.rootSuite.suites[index];

const getInnerSuite = (report: Report, outerIndex = 0, innerIndex = 0) =>
  getOuterSuite(report, outerIndex).suites[innerIndex];

const collectTests = (s: SuiteModel): TestModel[] => {
  const tests: TestModel[] = [];
  const walk = (node: SuiteModel) => {
    for (const t of node?.tests ?? []) tests.push(t);
    for (const child of node?.suites ?? []) walk(child);
  };
  walk(s);
  return tests;
};

const byTitle = <T extends { title?: string | null }>(items: T[]) =>
  new Map(items.map(item => [String(item.title), item]));

const expectWarning = (report: Report, matcher = /ended early/i) => {
  expect(report.warnings?.length).toBeGreaterThan(0);
  expect(report.warnings?.[0]).toMatch(matcher);
};

const expectNoWarnings = (report: Report) => {
  expect(report.warnings).toBeUndefined();
};

function runMocha(
  fixtureFiles: string[] | string,
  mochaArgs: string[] = []
): Report {
  const reportDirName = `.tmp-mochawesome-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const reportDir = path.join(pkgRoot, reportDirName);
  const keepTmp = process.env.MOCHAWESOME_KEEP_TMP === '1';
  const filenames = Array.isArray(fixtureFiles) ? fixtureFiles : [fixtureFiles];
  const fixtures = filenames.map(filename =>
    path.join(__dirname, 'fixtures', 'mocha', filename)
  );
  const isParallel = mochaArgs.includes('--parallel');

  try {
    const res = spawnSync(
      process.execPath,
      [
        mochaBin,
        ...mochaArgs,
        ...(isParallel ? ['--require', registerPath] : []),
        '--reporter',
        reporterCjs,
        '--reporter-option',
        `reportDir=${reportDir}`,
        '--',
        ...fixtures,
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
    if (res.error || res.status === null) {
      throw new Error(
        `mocha spawn failed\nstatus=${res.status}\nsignal=${res.signal}\nstdout:\n${stdout}\nstderr:\n${stderr}`
      );
    }
    // otherwise: proceed to read mochawesome.json + schema validate

    const outPath = path.join(reportDir, 'mochawesome.json');
    if (!fs.existsSync(outPath)) {
      const files = fs.existsSync(reportDir) ? fs.readdirSync(reportDir) : [];
      throw new Error(
        [
          `mochawesome.json missing at: ${outPath}`,
          `files in reportDir: ${files.join(', ')}`,
          `mocha exit: ${res.status} signal: ${res.signal ?? 'none'}`,
          `stdout:\n${stdout}`,
          `stderr:\n${stderr}`,
        ].join('\n')
      );
    }

    const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    const ok = validate(report);
    if (!ok) {
      throw new Error(
        `schema validation failed:\n${JSON.stringify(validate.errors, null, 2)}`
      );
    }
    return report as Report;
  } finally {
    if (!keepTmp) {
      fs.rmSync(reportDir, { recursive: true, force: true });
    }
  }
}

describe('mocha integration', () => {
  it('basic fixture', () => {
    const report = runMocha('basic.spec.js');

    // Suite tree assertions
    const outer = getOuterSuite(report);
    expect(report.rootSuite.suites.length).toBe(1);
    expect(outer.id).toBe('s0.1');
    expect(outer.title).toBe('outer');
    expect(outer.suites.length).toBe(1);

    const inner = getInnerSuite(report);
    expect(inner.id).toBe('s0.1.1');
    expect(inner.title).toBe('inner');

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
    expect(report.stats).toEqual({
      suites: 2,
      tests: 3,
      passes: 1,
      failures: 1,
      failuresByType: { tests: 1, hooks: 0 },
      pending: 1,
      skipped: 0,
      start: expect.any(String),
      end: expect.any(String),
      durationMs: expect.any(Number),
    });
  });

  it('hook-fail fixture', () => {
    const report = runMocha('hook-fail.spec.js');

    // Suite tree assertions
    const outer = getOuterSuite(report);
    expect(report.rootSuite.suites.length).toBe(1);
    expect(outer.id).toBe('s0.1');
    expect(outer.title).toBe('outer');
    expect(outer.suites.length).toBe(1);

    const inner = getInnerSuite(report);
    expect(inner.id).toBe('s0.1.1');
    expect(inner.title).toBe('inner');

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

    // Warning on hook fail
    expectWarning(report);
  });

  it('retries fixture', () => {
    const report = runMocha('retry.spec.js');
    const inner = getInnerSuite(report);
    const flaky = inner.tests.find(t => t.title === 'flaky');
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

    // No warnings expected
    expectNoWarnings(report);
  });

  it('bail fixture: emits warning and counts executed tests only', () => {
    const report = runMocha('bail.spec.js', ['--bail']);
    const inner = getInnerSuite(report);

    expect(inner.tests.length).toBe(1);
    expect(inner.tests[0].state).toBe('failed');
    expect(report.stats.tests).toBe(1);
    expect(report.stats.failures).toBe(1);

    expectWarning(report);
  });

  it('bail-hook fixture: emits warning and counts executed tests only', () => {
    const report = runMocha('bail-hook.spec.js', ['--bail']);

    // outer has two inner suites
    const outer = getOuterSuite(report);
    expect(report.rootSuite.suites.length).toBe(1);
    expect(outer.suites.length).toBe(2);

    const innerPass = outer.suites[0];
    expect(innerPass.title).toBe('inner-pass');
    expect(innerPass.tests.length).toBe(1);
    expect(innerPass.tests[0].state).toBe('passed');

    const innerHookFail = outer.suites[1];
    expect(innerHookFail.title).toBe('inner-hook-fail');
    expect(innerHookFail.hooks.length).toBe(1);
    expect(innerHookFail.hooks[0].state).toBe('failed');
    expect(innerHookFail.hooks[0].error?.message).toBe('hook boom');

    // With --bail, only the first suite's test executes before the hook failure aborts.
    expect(report.stats.tests).toBe(1);
    expect(report.stats.passes).toBe(1);
    expect(report.stats.failures).toBe(1);
    expect(report.stats.failuresByType).toEqual({ tests: 0, hooks: 1 });

    expectWarning(report);
  });

  it('timeout fixture', () => {
    const report = runMocha('timeout.spec.js');
    const inner = getInnerSuite(report);

    expect(inner.tests.length).toBe(1);
    expect(inner.tests[0].title).toBe('times out');
    expect(inner.tests[0].state).toBe('failed');
    expect(inner.tests[0].error?.message).toMatch(/timeout/i);

    expect(report.stats.tests).toBe(1);
    expect(report.stats.passes).toBe(0);
    expect(report.stats.failures).toBe(1);
    expect(report.stats.failuresByType).toEqual({ tests: 1, hooks: 0 });
    expect(report.stats.pending).toBe(0);

    // No warnings expected
    expectNoWarnings(report);
  });

  it('bail + retry: does not warn when retries recover', () => {
    const report = runMocha('bail-retry.spec.js', ['--bail']);
    const inner = getInnerSuite(report);

    const flaky = inner.tests.find(t => t.title === 'flaky');
    expect(flaky?.state).toBe('passed');
    expect(flaky?.attempt?.current).toBe(2);

    expect(report.stats.tests).toBe(2);
    expect(report.stats.passes).toBe(2);
    expect(report.stats.failures).toBe(0);
    expectNoWarnings(report);
  });

  it('duplicate-titles fixture', () => {
    const report = runMocha('duplicate-titles.spec.js');

    const outer = getOuterSuite(report);
    expect(outer.title).toBe('outer');
    expect(outer.suites.length).toBe(2);

    const innerA = outer.suites.find(s => s.title === 'inner-a');
    const innerB = outer.suites.find(s => s.title === 'inner-b');
    expect(innerA).toBeTruthy();
    expect(innerB).toBeTruthy();

    expect(innerA?.tests.length).toBe(1);
    expect(innerB?.tests.length).toBe(1);
    expect(innerA?.tests[0].title).toBe('passes');
    expect(innerB?.tests[0].title).toBe('passes');

    // Serial IDs should differ because suite path differs.
    expect(innerA?.tests[0].id).not.toBe(innerB?.tests[0].id);
    expect(innerA?.tests[0].state).toBe('passed');
    expect(innerB?.tests[0].state).toBe('passed');

    expect(report.stats.tests).toBe(2);
    expect(report.stats.passes).toBe(2);
    expect(report.stats.failures).toBe(0);
    expect(report.stats.pending).toBe(0);
    expect(report.stats.skipped).toBe(0);
    expectNoWarnings(report);
  });

  it('after-all-fail fixture', () => {
    const report = runMocha('after-all-fail.spec.js');
    const inner = getInnerSuite(report);

    expect(inner.title).toBe('inner');

    // Tests still run and pass.
    expect(inner.tests.length).toBe(2);
    expect(inner.tests[0].state).toBe('passed');
    expect(inner.tests[1].state).toBe('passed');

    // after/afterAll hook fails once.
    expect(inner.hooks.length).toBeGreaterThanOrEqual(1);
    const afterHook = inner.hooks.find(h => h.type === 'after');
    expect(afterHook).toBeTruthy();
    expect(afterHook?.state).toBe('failed');
    expect(afterHook?.error?.message).toBe('afterAll boom');

    expect(report.stats.tests).toBe(2);
    expect(report.stats.passes).toBe(2);
    expect(report.stats.failures).toBe(1);
    expect(report.stats.failuresByType).toEqual({ tests: 0, hooks: 1 });
    expect(report.stats.pending).toBe(0);
    expect(report.stats.skipped).toBe(0);
    expectNoWarnings(report);
  });

  it('after-each-fail fixture', () => {
    const report = runMocha('after-each-fail.spec.js');
    const inner = getInnerSuite(report);

    expect(inner.title).toBe('inner');

    // Tests themselves pass.
    expect(inner.tests.length).toBe(1);
    expect(inner.tests[0].state).toBe('passed');

    // afterEach hook fails for each executed test.
    const afterEachHooks = inner.hooks.filter(h => h.type === 'afterEach');
    expect(afterEachHooks.length).toBeGreaterThanOrEqual(1);
    for (const h of afterEachHooks) {
      expect(h.state).toBe('failed');
      expect(h.error?.message).toBe('afterEach boom');
    }

    expect(report.stats.tests).toBe(1);
    expect(report.stats.passes).toBe(1);
    expect(report.stats.failures).toBe(1);

    expect(report.stats.failuresByType?.tests ?? 0).toBe(0);
    expect(report.stats.failuresByType?.hooks).toBe(1);

    expect(report.stats.pending).toBe(0);
    expect(report.stats.skipped).toBe(0);
    expectWarning(report);
  });

  it('before-each-fail fixture', () => {
    const report = runMocha('before-each-fail.spec.js');
    const inner = getInnerSuite(report);

    expect(inner.title).toBe('inner');

    // beforeEach hook fails before any test executes.
    const beforeEachHook = inner.hooks.find(h => h.type === 'beforeEach');
    expect(beforeEachHook).toBeTruthy();
    expect(beforeEachHook?.state).toBe('failed');
    expect(beforeEachHook?.error?.message).toBe('beforeEach boom');

    expect(inner.tests.length).toBe(1);
    expect(inner.tests[0].state).toBe('skipped');

    expect(report.stats.tests).toBe(1);
    expect(report.stats.passes).toBe(0);
    expect(report.stats.failures).toBe(1);
    expect(report.stats.failuresByType).toEqual({ tests: 0, hooks: 1 });
    expect(report.stats.pending).toBe(0);
    expect(report.stats.skipped).toBe(1);

    // Expect an ended-early warning.
    expectWarning(report);
  });

  it('skip fixture', () => {
    const report = runMocha('skip.spec.js');

    const outer = getOuterSuite(report);
    const inner = outer.suites[0];

    const tests = collectTests(inner);
    const byTitleMap = byTitle(tests);

    // These must exist and be correctly classified.
    expect(byTitleMap.get('explicit skip')?.state).toBe('skipped');

    // Mocha does not reliably preserve a distinguishable marker between `it.skip('name')`
    // and declared-pending (`it('name')`) in the reporter event payload. Accept either
    // pending or skipped here, but enforce the aggregate counts below.
    expect(['pending', 'skipped']).toContain(byTitleMap.get('it.skip')?.state);

    expect(byTitleMap.get('passes')?.state).toBe('passed');

    // If present, it must be skipped.
    const skippedBySuite = byTitleMap.get('skipped by suite');
    expect(skippedBySuite && skippedBySuite.state !== 'skipped').toBe(false);

    expect(report.stats.passes).toBe(1);
    expect(report.stats.failures).toBe(0);

    // We expect at least two non-executed tests across skip mechanisms.
    // Depending on Mocha's emitted payload, `it.skip` may appear as pending or skipped.
    expect(report.stats.skipped + report.stats.pending).toBeGreaterThanOrEqual(
      2
    );

    // But the runtime `this.skip()` case must count as skipped.
    expect(report.stats.skipped).toBeGreaterThanOrEqual(1);

    expectNoWarnings(report);
  });

  it('only / grep filtering: non-selected tests are skipped', () => {
    const report = runMocha('only.spec.js');

    const inner = getInnerSuite(report);
    expect(inner.title).toBe('inner');

    const byTitleMap = byTitle(inner.tests);

    expect(byTitleMap.get('runs')?.state).toBe('passed');
    expect(byTitleMap.has('filtered out 1')).toBe(false);
    expect(byTitleMap.has('filtered out 2')).toBe(false);

    expect(report.stats.tests).toBe(1);
    expect(report.stats.passes).toBe(1);
    expect(report.stats.failures).toBe(0);
    expect(report.stats.pending).toBe(0);
    expect(report.stats.skipped).toBe(0);
    expectNoWarnings(report);
  });

  it('serial mode: multi-file run aggregates correctly and keeps suites distinct', () => {
    const report = runMocha(['basic.spec.js', 'skip.spec.js']);

    // We expect two top-level "outer" suites (one per file).
    const outers = report.rootSuite.suites.filter(s => s.title === 'outer');
    expect(outers.length).toBe(2);
    expect(outers[0].id).not.toBe(outers[1].id);

    // Find the "inner" suites by unique test titles (avoids relying on `file` being present).
    const innerSuites = outers
      .map(o => o.suites.find(s => s.title === 'inner'))
      .filter(Boolean);

    expect(innerSuites.length).toBe(2);

    const innerBasic = innerSuites.find(s =>
      s?.tests.some(t => t.title === 'fails')
    );
    const innerSkip = innerSuites.find(s =>
      s?.tests.some(t => t.title === 'explicit skip')
    );

    expect(innerBasic).toBeTruthy();
    expect(innerSkip).toBeTruthy();

    // Basic fixture expectations
    const byTitleBasic = byTitle(innerBasic?.tests ?? []);
    expect(byTitleBasic.get('passes')?.state).toBe('passed');
    expect(byTitleBasic.get('fails')?.state).toBe('failed');
    expect(byTitleBasic.get('pending')?.state).toBe('pending');

    // Skip fixture expectations (match your existing skip test semantics)
    const skipTests = collectTests(innerSkip!);
    const byTitleSkip = byTitle(skipTests);

    expect(byTitleSkip.get('explicit skip')?.state).toBe('skipped');
    expect(['pending', 'skipped']).toContain(byTitleSkip.get('it.skip')?.state);
    expect(byTitleSkip.get('passes')?.state).toBe('passed');

    const skippedBySuite = byTitleSkip.get('skipped by suite');
    expect(skippedBySuite && skippedBySuite.state !== 'skipped').toBe(false);

    // Aggregate stats: stable assertions (avoid Mocha ambiguity around it.skip classification)
    expect(report.stats.passes).toBe(2); // basic passes + skip passes
    expect(report.stats.failures).toBe(1); // basic fails only
    expect(report.stats.pending + report.stats.skipped).toBeGreaterThanOrEqual(
      3
    ); // basic pending + skip non-executed
    expect(report.stats.tests).toBeGreaterThanOrEqual(6);
    expect(report.stats.tests).toBeLessThanOrEqual(7);

    // No bail/abort should be inferred for multi-file normal completion.
    expectNoWarnings(report);
  });

  it('parallel mode: stable ids and valid schema', () => {
    const report1 = runMocha(
      ['parallel/a.spec.js', 'parallel/b.spec.js'],
      ['--parallel', '--jobs', '2']
    );
    const report2 = runMocha(
      ['parallel/a.spec.js', 'parallel/b.spec.js'],
      ['--parallel', '--jobs', '2']
    );

    // Basic stats sanity: two files, each has 3 tests.
    expect(report1.stats.tests).toBe(6);
    expect(report1.stats.passes).toBe(2);
    expect(report1.stats.failures).toBe(2);
    expect(report1.stats.failuresByType).toEqual({ tests: 2, hooks: 0 });
    expect(report1.stats.pending).toBe(2);
    expect(report1.stats.skipped).toBe(0);
    expect(report1.warnings).toBeUndefined();

    // Collect all tests and hooks from the suite tree (order-independent)
    const collectNodes = (report: Report) => {
      const tests: TestModel[] = [];
      const hooks: HookModel[] = [];

      const walkSuite = (s: SuiteModel) => {
        for (const h of s?.hooks ?? []) hooks.push(h);
        for (const t of s?.tests ?? []) tests.push(t);
        for (const child of s?.suites ?? []) walkSuite(child);
      };

      walkSuite(report.rootSuite);
      return { tests, hooks };
    };

    const nodes1 = collectNodes(report1);

    // We should have 6 tests total across both files.
    expect(nodes1.tests.length).toBe(6);

    // Hooks: each file defines `before` + `beforeEach`. (Mocha may also emit additional hooks.)
    expect(nodes1.hooks.length).toBeGreaterThanOrEqual(4);

    // Hooks: none should fail.
    for (const h of nodes1.hooks) {
      expect(h.state).not.toBe('failed');
    }

    // Each file defines a single `before` hook; ensure we captured at least those and they passed.
    const beforeHooks = nodes1.hooks.filter(h => h.type === 'before');
    expect(beforeHooks.length).toBeGreaterThanOrEqual(2);
    for (const h of beforeHooks) {
      expect(h.state).toBe('passed');
    }

    // Each file defines a `beforeEach` hook; ensure we captured at least those and they passed.
    const beforeEachHooks = nodes1.hooks.filter(h => h.type === 'beforeEach');
    expect(beforeEachHooks.length).toBeGreaterThanOrEqual(2);
    for (const h of beforeEachHooks) {
      expect(h.state).toBe('passed');
    }

    // Tests: assert per-title state and (for failures) error message.
    const byTitle = new Map<string, TestModel>();
    for (const t of nodes1.tests) byTitle.set(String(t.title), t);

    const expectTest = (title: string, state: string) => {
      const t = byTitle.get(title);
      expect(t, `missing test: ${title}`).toBeTruthy();
      expect(t?.state).toBe(state);
      return t;
    };

    expectTest('a: passes', 'passed');
    expectTest('b: passes', 'passed');

    const aFail = expectTest('a: fails', 'failed');
    expect(aFail?.error?.message).toBe('boom');
    const bFail = expectTest('b: fails', 'failed');
    expect(bFail?.error?.message).toBe('boom');

    expectTest('a: pending', 'pending');
    expectTest('b: pending', 'pending');

    const collectIds = (report: Report) => {
      const suites = new Map<string, string>();
      const tests = new Map<string, string>();
      const hooks = new Map<string, string>();

      const walkSuite = (s: SuiteModel) => {
        if (s?.stableKey) suites.set(String(s.stableKey), String(s.id));
        for (const h of s?.hooks ?? []) {
          if (h?.stableKey) hooks.set(String(h.stableKey), String(h.id));
        }
        for (const t of s?.tests ?? []) {
          if (t?.stableKey) tests.set(String(t.stableKey), String(t.id));
        }
        for (const child of s?.suites ?? []) walkSuite(child);
      };

      walkSuite(report.rootSuite);
      return { suites, tests, hooks };
    };

    const ids1 = collectIds(report1);
    const ids2 = collectIds(report2);

    // Light id-format sanity check
    const isStableId = (prefix: string, id: string) =>
      new RegExp(`^${prefix}_[0-9a-f]{12}$`).test(id);

    for (const id of ids1.tests.values())
      expect(isStableId('t', id)).toBe(true);
    for (const id of ids1.suites.values())
      expect(isStableId('s', id)).toBe(true);
    for (const id of ids1.hooks.values())
      expect(isStableId('h', id)).toBe(true);

    // Ensure we actually captured stable keys
    expect(ids1.tests.size).toBeGreaterThan(0);
    expect(ids1.suites.size).toBeGreaterThan(0);

    // IDs must be deterministic across parallel runs.
    expect(ids1.tests.size).toBe(ids2.tests.size);
    for (const [k, id] of ids1.tests.entries()) {
      expect(ids2.tests.get(k)).toBe(id);
    }

    expect(ids1.suites.size).toBe(ids2.suites.size);
    for (const [k, id] of ids1.suites.entries()) {
      expect(ids2.suites.get(k)).toBe(id);
    }

    expect(ids1.hooks.size).toBe(ids2.hooks.size);
    for (const [k, id] of ids1.hooks.entries()) {
      expect(ids2.hooks.get(k)).toBe(id);
    }
  });
});
