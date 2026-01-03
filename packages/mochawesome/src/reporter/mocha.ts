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
import { stableId } from '../core/id';
import { isoNow, msNow } from '../core/utils';

function isHook(node: Mocha.Test | Mocha.Hook): node is Mocha.Hook {
  return node.type === 'hook';
}

const getCurrentRetry = (test: Mocha.Test): number => {
  // @ts-expect-error: @types/mocha marks currentRetry() as protected, but it exists at runtime on Test.
  if (typeof test.currentRetry === 'function') return test.currentRetry();
  // @ts-expect-error: @types/mocha marks _currentRetry as private, but it exists at runtime on Test.
  return typeof test._currentRetry === 'number' ? test._currentRetry : 0;
};

const getRetries = (test: Mocha.Test): number | undefined => {
  if (typeof test.retries === 'function') {
    const n = test.retries();
    return typeof n === 'number' && n >= 0 ? n : undefined;
  }
  // @ts-expect-error: @types/mocha marks _retries as private, but it exists at runtime on Test.
  const n = test._retries;
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

const getHookType = (hook: Mocha.Hook): Hook['type'] => {
  const hookTitle = hook.originalTitle ?? hook.title;
  return hookTitle.includes('before all')
    ? 'before'
    : hookTitle.includes('before each')
      ? 'beforeEach'
      : hookTitle.includes('after each')
        ? 'afterEach'
        : 'after';
};

const getPendingState = (test: Mocha.Test): Test['state'] => {
  // Mocha uses `pending` for both declared-pending tests (`it('name')`) and explicit skips
  // (`it.skip`, `describe.skip`, `this.skip()`). We want to preserve both semantics:
  // - "pending"  => declared TODO/unimplemented
  // - "skipped"  => explicitly skipped / filtered / runtime skipped

  // If the parent suite is skipped/pending (e.g. `describe.skip(...)`), treat tests as skipped.
  const parentPending = !!test?.parent?.pending;
  if (parentPending) return 'skipped';

  const fn = test.fn;
  const body = test.body;

  // If we still have a function/body, it was explicitly skipped.
  if (typeof fn === 'function') return 'skipped';
  if (typeof body === 'string' && body.trim().length > 0) return 'skipped';

  // Otherwise treat as declared pending (no fn).
  return 'pending';
};

class Mochawesome {
  constructor(runner: Mocha.Runner, options: Mocha.MochaOptions) {
    const isParallel =
      // @ts-expect-error: isParallelMode exists on Runner as of v8.2.0
      typeof runner.isParallelMode === 'function' && runner.isParallelMode();

    const registerLoaded = globalThis.__mochawesomeRegisterLoaded__ === true;
    if (isParallel && !registerLoaded) {
      throw new Error(
        'Parallel mode requires registering mochawesome to patch Mocha serialization. Run Mocha with: --require mochawesome/register'
      );
    }

    const rawDir = options?.reporterOptions?.reportDir ?? 'mochawesome-report';
    const reportDir = path.isAbsolute(rawDir)
      ? rawDir
      : path.resolve(process.cwd(), rawDir);
    fs.mkdirSync(reportDir, { recursive: true });

    const schemaVersion = '8.0.0-alpha.0';

    const startedAtIso = isoNow();
    const startedAtMs = msNow();

    const rootSuite: Suite = createRootSuite({
      title: '',
      fullTitle: '',
      timing: { start: startedAtIso, end: startedAtIso, durationMs: 0 },
    });

    const suiteNodeByMochaSuite = new WeakMap<Mocha.Suite, Suite>();
    suiteNodeByMochaSuite.set(runner.suite, rootSuite);

    const suiteNodeByKey = new Map<string, Suite>();

    const testNodeByMochaTest = new WeakMap<Mocha.Test, Test>();
    const testStartMsByMochaTest = new WeakMap<Mocha.Test, number>();

    const hookNodeByMochaHook = new WeakMap<Mocha.Hook, Hook>();
    const hookStartMsByMochaHook = new WeakMap<Mocha.Hook, number>();
    const hookNodeByKey = new Map<string, Hook>();

    const abortedSuites = new WeakSet<Mocha.Suite>();

    let hookFailCount = 0;

    // Mocha can emit different object instances for the same logical test across events,
    // especially for declared pending tests. Track by a stable string key.
    const testNodeByKey = new Map<string, Test>();
    const countedTestKeys = new Set<string>();

    const getSuiteKey = (suiteNode: Suite) =>
      suiteNode.stableKey ?? suiteNode.id.slice(1);

    const getRunnableFullTitle = (runnable: Mocha.Runnable) =>
      typeof runnable?.fullTitle === 'function'
        ? String(runnable.fullTitle())
        : String(runnable?.title ?? '');

    const getRunnableFile = (
      runnable: Mocha.Runnable,
      fallbackSuite?: Mocha.Suite
    ) => {
      const file = runnable?.file ?? fallbackSuite?.file;
      return file ? String(file) : '';
    };

    const getSuiteStableKey = (parentNode: Suite, suite: Mocha.Suite) => {
      const parentKey = getSuiteKey(parentNode);
      return `${parentKey}/suite:${String(suite.title ?? '')}|${
        suite.file ? String(suite.file) : ''
      }`;
    };

    const getTestKey = (runnable: Mocha.Runnable) => {
      const fullTitle = getRunnableFullTitle(runnable);
      const file = getRunnableFile(runnable);

      // In parallel mode, suite/test objects can be de-referenced across events;
      // keys must not depend on suite-node lookups.
      if (isParallel) return `${file}|${fullTitle}`;

      // Serial mode: include parent suite path so identical titles in different suites don't collide.
      const parentMochaSuite = runnable?.parent ?? runner.suite;
      const parentNode =
        suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;
      const suitePath = getSuiteKey(parentNode);
      return `${suitePath}|${file}|${fullTitle}`;
    };

    const getHookKey = (hook: Mocha.Hook) => {
      const type = getHookType(hook);
      const title = String(hook?.title ?? type);
      const parent = hook.parent;

      const parentFullTitle =
        parent && typeof parent.fullTitle === 'function'
          ? String(parent.fullTitle())
          : parent
            ? String(parent.title ?? '')
            : '';

      const file = parent && parent.file ? String(parent.file) : '';
      return `${file}|${parentFullTitle}|hook:${type}|${title}`;
    };

    const finalizeTiming = (
      node: Suite | Test | Hook,
      endIso: string,
      startMsOverride?: number,
      endMsOverride?: number
    ) => {
      node.timing.end = endIso;
      const startMs =
        typeof startMsOverride === 'number'
          ? startMsOverride
          : Date.parse(node.timing.start);
      const endMs =
        typeof endMsOverride === 'number' ? endMsOverride : Date.parse(endIso);
      node.timing.durationMs =
        Number.isFinite(startMs) && Number.isFinite(endMs)
          ? Math.max(0, endMs - startMs)
          : 0;
    };

    const createTestNode = (
      parentNode: Suite,
      mochaTest: Mocha.Test,
      options?: {
        initialState?: Test['state'];
        timingIso?: string;
        key?: string;
        setStartMs?: boolean;
      }
    ): { key: string; node: Test } => {
      const key = options?.key ?? getTestKey(mochaTest);
      const stableKey = key;
      const startIso = options?.timingIso ?? isoNow();
      const initialState = options?.initialState ?? 'pending';

      const node = addTest(parentNode, {
        id: isParallel ? stableId('t', stableKey) : undefined,
        stableKey,
        title: String(mochaTest?.title ?? ''),
        fullTitle:
          typeof mochaTest?.fullTitle === 'function'
            ? String(mochaTest.fullTitle())
            : String(mochaTest?.title ?? ''),
        ...(mochaTest?.file ? { file: String(mochaTest.file) } : {}),
        state: initialState,
        timing: { start: startIso, end: startIso, durationMs: 0 },
      });

      setAttempt(node, mochaTest);

      testNodeByKey.set(key, node);
      testNodeByMochaTest.set(mochaTest, node);

      const shouldSetStartMs = options?.setStartMs ?? true;
      if (shouldSetStartMs && !testStartMsByMochaTest.has(mochaTest)) {
        testStartMsByMochaTest.set(mochaTest, Date.now());
      }

      return { key, node };
    };

    const createHookNode = (
      parentNode: Suite,
      hook: Mocha.Hook,
      options?: { stableKey?: string; timingIso?: string }
    ) => {
      const hookType: Hook['type'] = getHookType(hook);
      const stableKey = options?.stableKey ?? getHookKey(hook);
      const startIso = options?.timingIso ?? isoNow();
      const node = addHook(parentNode, {
        id: isParallel ? stableId('h', stableKey) : undefined,
        stableKey,
        title: String(hook?.title ?? hookType),
        type: hookType,
        state: 'pending',
        timing: { start: startIso, end: startIso, durationMs: 0 },
      });
      return node;
    };

    const toErrorInfo = (
      error: unknown,
      options?: { includeAssertion?: boolean }
    ): ErrorInfo => {
      const err = error as {
        name?: unknown;
        message?: unknown;
        stack?: unknown;
        actual?: unknown;
        expected?: unknown;
        operator?: unknown;
      };
      return {
        name: err?.name ? String(err.name) : undefined,
        message: err?.message ? String(err.message) : String(err ?? 'Error'),
        stack: err?.stack ? String(err.stack) : undefined,
        ...(options?.includeAssertion
          ? {
              actual: err?.actual,
              expected: err?.expected,
              operator: err?.operator ? String(err.operator) : undefined,
            }
          : {}),
      };
    };

    const recomputeStats = (s: Suite) => {
      let suites = 0;
      let tests = 0;
      let passes = 0;
      let failures = 0;
      let pending = 0;
      let skipped = 0;
      let hookFailures = 0;

      const walkSuite = (node: Suite) => {
        for (const child of node.suites) {
          suites += 1;
          walkSuite(child);
        }
        for (const t of node.tests) {
          tests += 1;
          if (t.state === 'passed') passes += 1;
          else if (t.state === 'failed') failures += 1;
          else if (t.state === 'pending') pending += 1;
          else skipped += 1;
        }
        for (const h of node.hooks) {
          if (h.state === 'failed') hookFailures += 1;
        }
      };

      walkSuite(s);
      return {
        suites,
        tests,
        passes,
        failures,
        pending,
        skipped,
        hookFailures,
      };
    };

    let testCount = 0;
    let passCount = 0;
    let failCount = 0;
    let pendingCount = 0;
    let skippedCount = 0;
    let suiteCount = 0;
    const warnings: string[] = [];

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
      const suiteStableKey = getSuiteStableKey(parentNode, suite);

      const startIso = isoNow();
      const childNode = addSuite(parentNode, {
        id: isParallel ? stableId('s', suiteStableKey) : undefined,
        stableKey: suiteStableKey,
        title: String(suite.title ?? ''),
        fullTitle:
          typeof suite.fullTitle === 'function'
            ? String(suite.fullTitle())
            : String(suite.title ?? ''),
        ...(suite.file ? { file: String(suite.file) } : {}),
        timing: { start: startIso, end: startIso, durationMs: 0 },
      });

      suiteNodeByMochaSuite.set(suite, childNode);
      suiteNodeByKey.set(suiteStableKey, childNode);
      suiteCount += 1;
    });

    runner.on('suite end', (suite: Mocha.Suite) => {
      if (!suite || suite.root) return;
      const node = suiteNodeByMochaSuite.get(suite);
      if (!node) return;

      const endIso = isoNow();
      finalizeTiming(node, endIso);
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

      ({ node } = createTestNode(parentNode, test, { key }));
    });

    runner.on('pass', (test: Mocha.Test) => {
      const key = getTestKey(test);
      const node = testNodeByMochaTest.get(test) ?? testNodeByKey.get(key);
      if (!node) return;
      node.state = 'passed';
      // Ensure subsequent events for this specific object instance can resolve.
      testNodeByMochaTest.set(test, node);
    });

    runner.on('fail', (runnable: Mocha.Test | Mocha.Hook, error: unknown) => {
      if (isHook(runnable)) {
        const hookNode =
          hookNodeByMochaHook.get(runnable) ??
          (isParallel ? hookNodeByKey.get(getHookKey(runnable)) : undefined);
        if (hookNode) {
          // Ensure subsequent events for this specific object instance can resolve.
          hookNodeByMochaHook.set(runnable, hookNode);
          hookNode.state = 'failed';
          hookNode.error = toErrorInfo(error);
          hookFailCount += 1;

          const hookTitle = String(runnable.originalTitle ?? '');
          if (
            hookTitle.includes('before all') ||
            hookTitle.includes('before each')
          ) {
            const s = runnable.parent;
            if (s) abortedSuites.add(s);

            // If a beforeEach fails, Mocha may not emit a "pending" event for the
            // current test. Mark it as skipped so the report reflects non-execution.
            if (hookTitle.includes('before each')) {
              const currentTest = runnable.ctx?.currentTest as
                | Mocha.Test
                | undefined;
              if (currentTest) {
                const key = getTestKey(currentTest);
                let node =
                  testNodeByMochaTest.get(currentTest) ??
                  testNodeByKey.get(key);

                // Ensure a node exists for the current test.
                if (!node) {
                  const parentMochaSuite = currentTest?.parent ?? runner.suite;
                  const parentNode =
                    suiteNodeByMochaSuite.get(parentMochaSuite) ?? rootSuite;

                  ({ node } = createTestNode(parentNode, currentTest, {
                    key,
                    initialState: 'skipped',
                    timingIso: isoNow(),
                    setStartMs: false,
                  }));
                }

                // Mark as skipped and attach to this Mocha test instance.
                node.state = 'skipped';
                testNodeByMochaTest.set(currentTest, node);

                // Count exactly once per logical test.
                if (!countedTestKeys.has(key)) {
                  countedTestKeys.add(key);
                  testCount += 1;
                  skippedCount += 1;
                }
              }
            }
          }
        }
      } else {
        const test = runnable;
        const key = getTestKey(test);
        const node = testNodeByMochaTest.get(test) ?? testNodeByKey.get(key);
        if (node) {
          node.state = 'failed';
          // Ensure subsequent events for this specific object instance can resolve.
          testNodeByMochaTest.set(test, node);
          node.error = toErrorInfo(error, { includeAssertion: true });
        }
      }
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

        ({ node } = createTestNode(parentNode, test, { key }));
      }
      // Attach node to this specific Mocha test object and ensure state.
      if (node) {
        testNodeByMochaTest.set(test, node);
        testStartMsByMochaTest.set(test, Date.now());
        node.state = getPendingState(test);
        setAttempt(node, test);
      }
      // Count exactly once per logical test.
      if (!countedTestKeys.has(key)) {
        countedTestKeys.add(key);
        testCount += 1;
        if (node?.state === 'pending') {
          pendingCount += 1;
        } else {
          skippedCount += 1;
        }
      }
    });

    runner.on('test end', (test: Mocha.Test) => {
      const key = getTestKey(test);
      const node = testNodeByMochaTest.get(test) ?? testNodeByKey.get(key);
      if (!node) return;
      // Ensure subsequent events for this specific object instance can resolve.
      testNodeByMochaTest.set(test, node);

      const startMs = testStartMsByMochaTest.get(test);
      finalizeTiming(node, isoNow(), startMs, Date.now());

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

      const hookType: Hook['type'] = getHookType(hook);
      const suiteKey = getSuiteKey(parentNode);
      const hookStableKey = isParallel
        ? getHookKey(hook)
        : `${suiteKey}/hook:${hookType}|${String(hook?.title ?? '')}`;
      const node = createHookNode(parentNode, hook, {
        stableKey: hookStableKey,
      });

      hookNodeByKey.set(hookStableKey, node);
      hookNodeByMochaHook.set(hook, node);
      hookStartMsByMochaHook.set(hook, Date.now());
    });

    runner.on('hook end', (hook: Mocha.Hook) => {
      const key = isParallel ? getHookKey(hook) : undefined;
      const node =
        hookNodeByMochaHook.get(hook) ??
        (key ? hookNodeByKey.get(key) : undefined);
      if (!node) return;
      // Ensure subsequent events for this specific object instance can resolve.
      hookNodeByMochaHook.set(hook, node);

      const startMs = hookStartMsByMochaHook.get(hook);
      finalizeTiming(node, isoNow(), startMs, Date.now());

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

      // Parallel mode: Mocha's reporter event stream can be incomplete (suite/pending events).
      // Build/complete the suite/test tree from the final serialized suite graph and compute stats from it.
      if (isParallel) {
        const ensureSuiteNode = (
          mochaSuite: Mocha.Suite,
          parentNode: Suite
        ) => {
          // Root is represented by rootSuite.
          if (mochaSuite.root) {
            suiteNodeByMochaSuite.set(mochaSuite, rootSuite);
            return rootSuite;
          }

          const suiteStableKey = getSuiteStableKey(parentNode, mochaSuite);

          // Prefer stableKey map (worker/main suite objects are not referentially equal).
          const existing = suiteNodeByKey.get(suiteStableKey);
          if (existing) {
            suiteNodeByMochaSuite.set(mochaSuite, existing);
            return existing;
          }

          const startIso = startedAtIso;
          const node = addSuite(parentNode, {
            id: stableId('s', suiteStableKey),
            stableKey: suiteStableKey,
            title: String(mochaSuite.title ?? ''),
            fullTitle:
              typeof mochaSuite.fullTitle === 'function'
                ? String(mochaSuite.fullTitle())
                : String(mochaSuite.title ?? ''),
            ...(mochaSuite.file ? { file: String(mochaSuite.file) } : {}),
            timing: { start: startIso, end: endedAtIso, durationMs: 0 },
          });

          suiteNodeByKey.set(suiteStableKey, node);
          suiteNodeByMochaSuite.set(mochaSuite, node);
          return node;
        };

        const ensureTestNode = (
          mochaTest: Mocha.Test,
          mochaSuite: Mocha.Suite,
          parentNode: Suite
        ) => {
          // In parallel mode, the serialized test objects in runner.suite may not have
          // full runtime shape. Derive stableKey using robust fallbacks so it matches
          // the event-time keys (which use file + fullTitle).
          const fullTitle = getRunnableFullTitle(mochaTest);
          const file = getRunnableFile(mochaTest, mochaSuite);

          const stableKey = `${file}|${fullTitle}`;

          let node = testNodeByKey.get(stableKey);
          if (node) return node;

          const pending = !!mochaTest.pending;
          const stateStr = String(mochaTest.state ?? '');
          const state: Test['state'] = pending
            ? getPendingState(mochaTest)
            : stateStr === 'passed'
              ? 'passed'
              : stateStr === 'failed'
                ? 'failed'
                : 'skipped';

          node = addTest(parentNode, {
            id: stableId('t', stableKey),
            stableKey,
            title: String(mochaTest.title ?? ''),
            fullTitle,
            ...(file ? { file } : {}),
            state,
            timing: { start: startedAtIso, end: endedAtIso, durationMs: 0 },
          });

          // Best-effort attempt info.
          try {
            setAttempt(node, mochaTest);
          } catch {
            // ignore
          }

          // Best-effort error info.
          const errObj = mochaTest.err as Error & {
            actual?: unknown;
            expected?: unknown;
            operator?: string;
          };
          if (state === 'failed' && errObj) {
            node.error = {
              name: errObj.name ? String(errObj.name) : undefined,
              message: errObj.message ? String(errObj.message) : String(errObj),
              stack: errObj.stack ? String(errObj.stack) : undefined,
              actual: errObj.actual,
              expected: errObj.expected,
              operator: errObj.operator ? String(errObj.operator) : undefined,
            };
          }

          testNodeByKey.set(stableKey, node);
          return node;
        };

        const walk = (mochaSuite: Mocha.Suite, parentNode: Suite) => {
          // If a before/beforeEach hook failed, do not count tests in that suite branch.
          if (abortedSuites.has(mochaSuite)) return;

          const node = ensureSuiteNode(mochaSuite, parentNode);

          for (const t of mochaSuite.tests ?? []) {
            ensureTestNode(t, mochaSuite, node);
          }

          for (const child of mochaSuite.suites ?? []) {
            walk(child, node);
          }
        };

        walk(runner.suite, rootSuite);

        // Recompute stats from the built tree.
        const computed = recomputeStats(rootSuite);
        suiteCount = computed.suites;
        testCount = computed.tests;
        passCount = computed.passes;
        failCount = computed.failures;
        pendingCount = computed.pending;
        skippedCount = computed.skipped;
        hookFailCount = computed.hookFailures;
      }

      const expectedTotal = runner.total;
      const didRunEndEarly =
        typeof expectedTotal === 'number' &&
        expectedTotal > 0 &&
        testCount < expectedTotal;

      // `runner.total` includes tests registered, including those filtered out by `.only` / `--grep`.
      // Only warn when the run actually ended early (bail/abort or a blocking hook failure).
      // @ts-expect-error: _abort is private
      const didAbort = !!runner._abort;
      const didBail = !!options?.bail;
      const didBlockOnHookFailure = hookFailCount > 0;

      if (didRunEndEarly && (didAbort || didBail || didBlockOnHookFailure)) {
        warnings.push(
          `Run ended early (bail/abort). Executed ${testCount}/${expectedTotal} tests; counts reflect executed tests only.`
        );
      }

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
        ...(warnings.length ? { warnings } : {}),
      });

      const out = path.join(reportDir, 'mochawesome.json');
      fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
    });
  }
}

export = Mochawesome;
