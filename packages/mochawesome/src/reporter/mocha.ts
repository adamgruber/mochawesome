import fs from 'node:fs';
import path from 'node:path';
import mochaPkg from 'mocha/package.json';
import type Mocha from 'mocha';
import {
  addHook,
  addSuite,
  addTest,
  createReport,
  createRootSuite,
} from '../core/model';
import type { ErrorInfo, Hook, Suite, Test } from '../core/model';

export default class Mochawesome {
  constructor(runner: Mocha.Runner, options: Mocha.MochaOptions) {
    const rawDir = options?.reporterOptions?.reportDir ?? 'mochawesome-report';
    const reportDir = path.isAbsolute(rawDir)
      ? rawDir
      : path.resolve(process.cwd(), rawDir);
    fs.mkdirSync(reportDir, { recursive: true });

    const schemaVersion = '8.0.0-alpha.0';

    const isoNow = () => new Date().toISOString();
    const msNow = () => Date.now();

    const startedAtIso = isoNow();
    const startedAtMs = msNow();

    const rootSuite: Suite = createRootSuite({
      title: '',
      fullTitle: '',
      timing: { start: startedAtIso, end: startedAtIso, durationMs: 0 },
    });

    const suiteNodeByMochaSuite = new WeakMap<Mocha.Suite, Suite>();
    suiteNodeByMochaSuite.set(runner.suite, rootSuite);

    const testNodeByMochaTest = new WeakMap<Mocha.Test, Test>();
    const testStartMsByMochaTest = new WeakMap<Mocha.Test, number>();

    const hookNodeByMochaHook = new WeakMap<Mocha.Hook, Hook>();
    const hookStartMsByMochaHook = new WeakMap<Mocha.Hook, number>();

    let hookFailCount = 0;

    // Mocha can emit different object instances for the same logical test across events,
    // especially for declared pending tests. Track by a stable string key.
    const testNodeByKey = new Map<string, Test>();
    const countedTestKeys = new Set<string>();

    const getTestKey = (runnable: Mocha.Runnable) => {
      const fullTitle =
        typeof runnable?.fullTitle === 'function'
          ? String(runnable.fullTitle())
          : String(runnable?.title ?? '');
      const file = runnable?.file ? String(runnable.file) : '';
      // Include parent suite path so identical titles in different suites don't collide.
      const parentMochaSuite = runnable?.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;
      const suitePath = parentNode.id.slice(1);
      return `${suitePath}|${file}|${fullTitle}`;
    };

    const getCurrentRetry = (test: Mocha.Test): number => {
      // @types/mocha marks currentRetry() as protected, but it exists at runtime on Test.
      const fn = (test as any).currentRetry as undefined | (() => number);
      if (typeof fn === 'function') return fn.call(test);
      const n = (test as any)._currentRetry;
      return typeof n === 'number' ? n : 0;
    };

    const getRetries = (test: Mocha.Test): number | undefined => {
      const fn = (test as any).retries as undefined | (() => number);
      if (typeof fn === 'function') {
        const n = fn.call(test);
        return typeof n === 'number' && n >= 0 ? n : undefined;
      }
      const n = (test as any)._retries;
      return typeof n === 'number' && n >= 0 ? n : undefined;
    };

    const setAttempt = (node: Test, test: Mocha.Test) => {
      const current = getCurrentRetry(test) + 1; // 1-based
      const retries = getRetries(test);
      const total = typeof retries === 'number' ? retries + 1 : undefined;
      node.attempt = {
        current,
        ...(typeof total === 'number' ? { total } : {}),
        ...(current > 1 ? { retry: true } : {}),
      };
    };

    let testCount = 0;
    let passCount = 0;
    let failCount = 0;
    let pendingCount = 0;
    let skippedCount = 0;
    let suiteCount = 0;

    runner.once('start', () => {
      // Ensure root timing start reflects actual run start.
      rootSuite.timing.start = isoNow();
    });

    runner.on('suite', (suite: Mocha.Suite) => {
      // Mocha emits an implicit root suite; we represent root ourselves.
      if (!suite || suite.root) return;

      const parentMochaSuite = suite.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

      const startIso = isoNow();
      const childNode = addSuite(parentNode, {
        title: String(suite.title ?? ''),
        fullTitle:
          typeof suite.fullTitle === 'function'
            ? String(suite.fullTitle())
            : String(suite.title ?? ''),
        ...(suite.file ? { file: String(suite.file) } : {}),
        timing: { start: startIso, end: startIso, durationMs: 0 },
      });

      suiteNodeByMochaSuite.set(suite, childNode);
      suiteCount += 1;
    });

    runner.on('suite end', (suite: Mocha.Suite) => {
      if (!suite || suite.root) return;
      const node = suiteNodeByMochaSuite.get(suite);
      if (!node) return;

      const endIso = isoNow();
      node.timing.end = endIso;

      const startMs = Date.parse(node.timing.start);
      const endMs = Date.parse(endIso);
      node.timing.durationMs =
        Number.isFinite(startMs) && Number.isFinite(endMs)
          ? Math.max(0, endMs - startMs)
          : 0;
    });

    runner.on('test', (test: Mocha.Test) => {
      const parentMochaSuite = test?.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

      const key = getTestKey(test);
      let node = testNodeByKey.get(key);

      // If we already created this test node via a different event (e.g. pending),
      // just attach it to this Mocha test object and start timing.
      if (node) {
        testNodeByMochaTest.set(test, node);
        if (!testStartMsByMochaTest.has(test))
          testStartMsByMochaTest.set(test, Date.now());
        setAttempt(node, test);
        return;
      }

      const startIso = isoNow();
      node = addTest(parentNode, {
        title: String(test?.title ?? ''),
        fullTitle:
          typeof test?.fullTitle === 'function'
            ? String(test.fullTitle())
            : String(test?.title ?? ''),
        ...(test?.file ? { file: String(test.file) } : {}),
        state: 'pending',
        timing: { start: startIso, end: startIso, durationMs: 0 },
      });

      setAttempt(node, test);

      testNodeByKey.set(key, node);
      testNodeByMochaTest.set(test, node);
      testStartMsByMochaTest.set(test, Date.now());
    });

    runner.on('pass', (test: Mocha.Test) => {
      const node = testNodeByMochaTest.get(test);
      if (node) node.state = 'passed';
    });

    runner.on('fail', (runnable: Mocha.Test | Mocha.Hook, error: unknown) => {
      const err = error as {
        name?: unknown;
        message?: unknown;
        stack?: unknown;
        actual?: unknown;
        expected?: unknown;
        operator?: unknown;
      };
      const hookNode =
        runnable.type === 'hook' && hookNodeByMochaHook.get(runnable);
      if (hookNode) {
        hookNode.state = 'failed';
        const info: ErrorInfo = {
          name: err?.name ? String(err.name) : undefined,
          message: err?.message ? String(err.message) : String(err ?? 'Error'),
          stack: err?.stack ? String(err.stack) : undefined,
        };
        hookNode.error = info;
        hookFailCount += 1;
        return;
      }

      const node =
        runnable.type === 'test' && testNodeByMochaTest.get(runnable);
      if (!node) return;
      node.state = 'failed';
      const info: ErrorInfo = {
        name: err?.name ? String(err.name) : undefined,
        message: err?.message ? String(err.message) : String(err ?? 'Error'),
        stack: err?.stack ? String(err.stack) : undefined,
        actual: err?.actual,
        expected: err?.expected,
        operator: err?.operator ? String(err.operator) : undefined,
      };
      node.error = info;
    });

    runner.on('pending', (test: Mocha.Test) => {
      const key = getTestKey(test);
      let node = testNodeByKey.get(key) ?? testNodeByMochaTest.get(test);

      // Some pending tests don't emit 'test'/'test end' consistently.
      // Ensure a node exists.
      if (!node) {
        const parentMochaSuite = test?.parent ?? runner.suite;
        const parentNode =
          suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

        const startIso = isoNow();
        node = addTest(parentNode, {
          title: String(test?.title ?? ''),
          fullTitle:
            typeof test?.fullTitle === 'function'
              ? String(test.fullTitle())
              : String(test?.title ?? ''),
          ...(test?.file ? { file: String(test.file) } : {}),
          state: 'pending',
          timing: { start: startIso, end: startIso, durationMs: 0 },
        });

        testNodeByKey.set(key, node);
      }
      // Attach node to this specific Mocha test object and ensure state.
      if (node) {
        testNodeByMochaTest.set(test, node);
        testStartMsByMochaTest.set(test, Date.now());
        node.state = 'pending';
        setAttempt(node, test);
      }
      // Count exactly once per logical test.
      if (!countedTestKeys.has(key)) {
        countedTestKeys.add(key);
        testCount += 1;
        pendingCount += 1;
      }
    });

    runner.on('test end', (test: Mocha.Test) => {
      const node = testNodeByMochaTest.get(test);
      if (!node) return;

      const endIso = isoNow();
      node.timing.end = endIso;

      const startMs = testStartMsByMochaTest.get(test);
      const endMs = Date.now();
      node.timing.durationMs =
        typeof startMs === 'number' ? Math.max(0, endMs - startMs) : 0;

      const key = getTestKey(test);
      if (!countedTestKeys.has(key)) {
        countedTestKeys.add(key);
        testCount += 1;
        if (node.state === 'passed') passCount += 1;
        else if (node.state === 'failed') failCount += 1;
        else if (node.state === 'pending') pendingCount += 1;
        else skippedCount += 1;
      }
    });

    runner.on('hook', (hook: Mocha.Hook) => {
      const parentMochaSuite = hook.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

      const hookType: Hook['type'] = hook.originalTitle?.includes('before all')
        ? 'before'
        : hook.originalTitle?.includes('before each')
        ? 'beforeEach'
        : hook.originalTitle?.includes('after each')
        ? 'afterEach'
        : 'after';

      const startIso = isoNow();
      const node = addHook(parentNode, {
        title: String(hook?.title ?? hookType),
        type: hookType,
        state: 'pending',
        timing: { start: startIso, end: startIso, durationMs: 0 },
      });

      hookNodeByMochaHook.set(hook, node);
      hookStartMsByMochaHook.set(hook, Date.now());
    });

    runner.on('hook end', (hook: Mocha.Hook) => {
      const node = hookNodeByMochaHook.get(hook);
      if (!node) return;

      const endIso = isoNow();
      node.timing.end = endIso;

      const startMs = hookStartMsByMochaHook.get(hook);
      const endMs = Date.now();
      node.timing.durationMs =
        typeof startMs === 'number' ? Math.max(0, endMs - startMs) : 0;

      if (node.state === 'pending') node.state = 'passed';
    });

    runner.on('retry', (test: Mocha.Test, _err: unknown) => {
      const key = getTestKey(test);
      const node = testNodeByKey.get(key) ?? testNodeByMochaTest.get(test);
      if (!node) return;

      // mark attempt info for this retry
      setAttempt(node, test);

      // ensure state is not left as 'failed' from prior attempt
      node.state = 'pending';
    });

    runner.once('end', () => {
      const endedAtIso = isoNow();
      const endedAtMs = msNow();

      rootSuite.timing.end = endedAtIso;
      rootSuite.timing.durationMs = Math.max(0, endedAtMs - startedAtMs);

      const report = createReport({
        schemaVersion,
        meta: {
          generatedAt: startedAtIso,
          durationMs: Math.max(0, endedAtMs - startedAtMs),
          runner: { name: 'mocha', version: mochaPkg.version },
          reporter: { name: 'mochawesome', version: schemaVersion },
          output: {
            reportDir,
            htmlFile: 'mochawesome.html',
            jsonFile: 'mochawesome.json',
            assetsDir: 'assets',
            assetMode: 'inline',
            attachmentMode: 'link',
          },
        },
        stats: {
          suites: suiteCount,
          tests: testCount,
          passes: passCount,
          failures: failCount + hookFailCount,
          failuresByType: {
            tests: failCount,
            hooks: hookFailCount,
          },
          pending: pendingCount,
          skipped: skippedCount,
          start: startedAtIso,
          end: endedAtIso,
          durationMs: Math.max(0, endedAtMs - startedAtMs),
        },
        rootSuite,
      });

      const out = path.join(reportDir, 'mochawesome.json');
      fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
    });
  }
}
