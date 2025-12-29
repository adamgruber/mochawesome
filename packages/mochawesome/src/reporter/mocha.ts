import fs from 'node:fs';
import path from 'node:path';
import { createReport } from '../core/model';
// TODO: Extract types to a separate file or reuse types from ../core/model.ts
type Timing = { start: string; end: string; durationMs: number };

type SuiteNode = {
  id: string;
  stableKey?: string;
  title: string;
  fullTitle: string;
  file?: string;
  timing: Timing;
  suites: SuiteNode[];
  tests: any[];
  hooks: any[];
  tags?: string[];
  extra?: Record<string, unknown>;
};

type TestNode = {
  id: string;
  stableKey?: string;
  title: string;
  fullTitle: string;
  file?: string;
  state: 'passed' | 'failed' | 'pending' | 'skipped';
  timing: Timing;
  speed?: 'fast' | 'medium' | 'slow';
  attempt?: { current: number; total?: number; retry?: boolean };
  error?: {
    name?: string;
    message: string;
    stack?: string;
    actual?: any;
    expected?: any;
    operator?: string;
  };
  attachments?: any[];
  tags?: string[];
  extra?: Record<string, unknown>;
};

type HookNode = {
  id: string;
  title: string;
  type: 'before' | 'beforeEach' | 'afterEach' | 'after';
  state: 'passed' | 'failed' | 'pending' | 'skipped';
  timing: Timing;
  error?: {
    name?: string;
    message: string;
    stack?: string;
  };
};

// TODO: add typings for objects in mocha events
export default class Mochawesome {
  constructor(runner: any, options: any) {
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

    const rootSuite: SuiteNode = {
      id: 's0',
      title: '',
      fullTitle: '',
      timing: { start: startedAtIso, end: startedAtIso, durationMs: 0 },
      suites: [],
      tests: [],
      hooks: [],
    };

    // Map Mocha suite objects to our suite nodes.
    const suiteNodeByMochaSuite = new WeakMap<object, SuiteNode>();
    suiteNodeByMochaSuite.set(runner.suite, rootSuite);

    const testNodeByMochaTest = new WeakMap<object, TestNode>();
    const testStartMsByMochaTest = new WeakMap<object, number>();

    const hookNodeByMochaHook = new WeakMap<object, HookNode>();
    const hookStartMsByMochaHook = new WeakMap<object, number>();

    let hookCount = 0;
    let hookFailCount = 0;

    // Mocha can emit different object instances for the same logical test across events,
    // especially for declared pending tests. Track by a stable string key.
    const testNodeByKey = new Map<string, TestNode>();
    const countedTestKeys = new Set<string>();

    const getTestKey = (test: any) => {
      const fullTitle =
        typeof test?.fullTitle === 'function'
          ? String(test.fullTitle())
          : String(test?.title ?? '');
      const file = test?.file ? String(test.file) : '';
      // Include parent suite path so identical titles in different suites don't collide.
      const parentMochaSuite = test?.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;
      const suitePath = parentNode.id.slice(1);
      return `${suitePath}|${file}|${fullTitle}`;
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

    runner.on('suite', (suite: any) => {
      // Mocha emits an implicit root suite; we represent root ourselves.
      if (!suite || suite.root) return;

      const parentMochaSuite = suite.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

      const idx = parentNode.suites.length + 1;
      const childId = `${parentNode.id}.${idx}`;

      const startIso = isoNow();
      const childNode: SuiteNode = {
        id: `s${childId.slice(1)}`, // parentNode.id already starts with 's'
        title: String(suite.title ?? ''),
        fullTitle:
          typeof suite.fullTitle === 'function'
            ? String(suite.fullTitle())
            : String(suite.title ?? ''),
        ...(suite.file ? { file: String(suite.file) } : {}),
        timing: { start: startIso, end: startIso, durationMs: 0 },
        suites: [],
        tests: [],
        hooks: [],
      };

      parentNode.suites.push(childNode);
      suiteNodeByMochaSuite.set(suite, childNode);
      suiteCount += 1;
    });

    runner.on('suite end', (suite: any) => {
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

    runner.on('test', (test: any) => {
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
        return;
      }

      const idx = parentNode.tests.length + 1;
      const suitePath = parentNode.id.slice(1);
      const id = `t${suitePath}.${idx}`;

      const startIso = isoNow();
      node = {
        id,
        title: String(test?.title ?? ''),
        fullTitle:
          typeof test?.fullTitle === 'function'
            ? String(test.fullTitle())
            : String(test?.title ?? ''),
        ...(test?.file ? { file: String(test.file) } : {}),
        state: 'pending', // default; updated by pass/fail/pending
        timing: { start: startIso, end: startIso, durationMs: 0 },
      };

      testNodeByKey.set(key, node);
      parentNode.tests.push(node);
      testNodeByMochaTest.set(test, node);
      testStartMsByMochaTest.set(test, Date.now());
    });

    runner.on('pass', (test: any) => {
      const node = testNodeByMochaTest.get(test);
      if (node) node.state = 'passed';
    });

    runner.on('fail', (test: any, err: any) => {
      const hookNode = hookNodeByMochaHook.get(test);
      if (hookNode) {
        hookNode.state = 'failed';
        hookNode.error = {
          name: err?.name ? String(err.name) : undefined,
          message: err?.message ? String(err.message) : String(err ?? 'Error'),
          stack: err?.stack ? String(err.stack) : undefined,
        };
        hookFailCount += 1;
        return;
      }

      const node = testNodeByMochaTest.get(test);
      if (!node) return;
      node.state = 'failed';
      node.error = {
        name: err?.name ? String(err.name) : undefined,
        message: err?.message ? String(err.message) : String(err ?? 'Error'),
        stack: err?.stack ? String(err.stack) : undefined,
        actual: err?.actual,
        expected: err?.expected,
        operator: err?.operator ? String(err.operator) : undefined,
      };
    });

    runner.on('pending', (test: any) => {
      const key = getTestKey(test);
      let node = testNodeByKey.get(key) ?? testNodeByMochaTest.get(test);

      // Some pending tests don't emit 'test'/'test end' consistently.
      // Ensure a node exists.
      if (!node) {
        const parentMochaSuite = test?.parent ?? runner.suite;
        const parentNode =
          suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

        const idx = parentNode.tests.length + 1;
        const suitePath = parentNode.id.slice(1);
        const id = `t${suitePath}.${idx}`;

        const startIso = isoNow();
        node = {
          id,
          title: String(test?.title ?? ''),
          fullTitle:
            typeof test?.fullTitle === 'function'
              ? String(test.fullTitle())
              : String(test?.title ?? ''),
          ...(test?.file ? { file: String(test.file) } : {}),
          state: 'pending',
          timing: { start: startIso, end: startIso, durationMs: 0 },
        };

        testNodeByKey.set(key, node);
        parentNode.tests.push(node);
      }
      // Attach node to this specific Mocha test object and ensure state.
      if (node) {
        testNodeByMochaTest.set(test, node);
        testStartMsByMochaTest.set(test, Date.now());
        node.state = 'pending';
      }
      // Count exactly once per logical test.
      if (!countedTestKeys.has(key)) {
        countedTestKeys.add(key);
        testCount += 1;
        pendingCount += 1;
      }
    });

    runner.on('test end', (test: any) => {
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

    runner.on('hook', (hook: any) => {
      const parentMochaSuite = hook?.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

      const idx = parentNode.hooks.length + 1;
      const suitePath = parentNode.id.slice(1);
      const id = `h${suitePath}.${idx}`;

      const hookType: HookNode['type'] = hook?.originalTitle.includes(
        'before all'
      )
        ? 'before'
        : hook?.originalTitle.includes('before each')
        ? 'beforeEach'
        : hook?.originalTitle.includes('after each')
        ? 'afterEach'
        : 'after';

      const startIso = isoNow();
      const node: HookNode = {
        id,
        title: String(hook?.title ?? hookType),
        type: hookType,
        state: 'pending',
        timing: { start: startIso, end: startIso, durationMs: 0 },
      };

      parentNode.hooks.push(node);
      hookNodeByMochaHook.set(hook, node);
      hookStartMsByMochaHook.set(hook, Date.now());
    });

    runner.on('hook end', (hook: any) => {
      const node = hookNodeByMochaHook.get(hook);
      if (!node) return;

      const endIso = isoNow();
      node.timing.end = endIso;

      const startMs = hookStartMsByMochaHook.get(hook);
      const endMs = Date.now();
      node.timing.durationMs =
        typeof startMs === 'number' ? Math.max(0, endMs - startMs) : 0;

      if (node.state === 'pending') node.state = 'passed';
      hookCount += 1;
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
          runner: { name: 'mocha', version: '0.0.0' },
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
