import fs from 'node:fs';
import path from 'node:path';
import { createReport } from '../core/model';

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
          tests: 0,
          passes: 0,
          failures: 0,
          pending: 0,
          skipped: 0,
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
