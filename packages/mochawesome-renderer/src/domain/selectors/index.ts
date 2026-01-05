import type { Report, Suite, Test, Hook } from '../../../../mochawesome/src/core/model';
import type { Index, NodeRecord } from '../types';
import type { Summary, SuiteCounts, SuiteTreeItem } from './types';

export type Selectors = {
  getSummary: () => Summary;
  getSuiteTree: () => SuiteTreeItem;
  getNode: (id: string) => NodeRecord | undefined;
  getChildren: (id: string) => NodeRecord[];
  getPath: (id: string) => NodeRecord[];
};

const createEmptyCounts = (): SuiteCounts => ({
  suites: 0,
  tests: 0,
  hooks: 0,
  passes: 0,
  failures: 0,
  pending: 0,
  skipped: 0,
  failuresByType: { tests: 0, hooks: 0 },
});

const addTestCounts = (counts: SuiteCounts, test: Test) => {
  counts.tests += 1;
  if (test.state === 'passed') counts.passes += 1;
  if (test.state === 'failed') {
    counts.failures += 1;
    counts.failuresByType.tests += 1;
  }
  if (test.state === 'pending') counts.pending += 1;
  if (test.state === 'skipped') counts.skipped += 1;
};

const addHookCounts = (counts: SuiteCounts, hook: Hook) => {
  counts.hooks += 1;
  if (hook.state === 'failed') {
    counts.failures += 1;
    counts.failuresByType.hooks += 1;
  }
};

const addSuiteCounts = (counts: SuiteCounts, child: SuiteCounts) => {
  counts.suites += child.suites;
  counts.tests += child.tests;
  counts.hooks += child.hooks;
  counts.passes += child.passes;
  counts.failures += child.failures;
  counts.pending += child.pending;
  counts.skipped += child.skipped;
  counts.failuresByType.tests += child.failuresByType.tests;
  counts.failuresByType.hooks += child.failuresByType.hooks;
};

const buildSuiteTree = (suite: Suite): SuiteTreeItem => {
  const children = suite.suites.map(buildSuiteTree);
  const counts = createEmptyCounts();
  counts.suites = 1;

  for (const child of children) addSuiteCounts(counts, child.counts);
  for (const test of suite.tests) addTestCounts(counts, test);
  for (const hook of suite.hooks) addHookCounts(counts, hook);

  return {
    id: suite.id,
    title: suite.title,
    fullTitle: suite.fullTitle,
    suite,
    counts,
    children,
  };
};

export const createSelectors = (report: Report, index: Index): Selectors => {
  const getSummary = (): Summary => ({
    stats: report.stats,
    meta: {
      generatedAt: report.meta.generatedAt,
      durationMs: report.meta.durationMs,
      runner: report.meta.runner,
      reporter: report.meta.reporter,
      output: report.meta.output,
    },
    warnings: report.warnings ?? [],
  });

  const getNode = (id: string) => index.byId.get(id);

  const getChildren = (id: string) => {
    const childIds = index.childrenById.get(id) ?? [];
    const children: NodeRecord[] = [];
    for (const childId of childIds) {
      const child = index.byId.get(childId);
      if (child) children.push(child);
    }
    return children;
  };

  const getPath = (id: string) => {
    const pathIds = index.pathById.get(id) ?? [];
    const path: NodeRecord[] = [];
    for (const pathId of pathIds) {
      const node = index.byId.get(pathId);
      if (node) path.push(node);
    }
    return path;
  };

  const getSuiteTree = () => buildSuiteTree(report.rootSuite);

  return {
    getSummary,
    getSuiteTree,
    getNode,
    getChildren,
    getPath,
  };
};
