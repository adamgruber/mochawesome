import { describe, expect, it } from 'vitest';
import basicFixture from '../fixtures/basic.json';
import hookFailFixture from '../fixtures/hook-fail.json';
import skipFixture from '../fixtures/skip.json';
import { buildIndex, createSelectors, loadReport } from '../src/domain';
import type { Report } from '../../mochawesome/src/core/model';

const load = (fixture: unknown) => loadReport(fixture as Report);

describe('selectors', () => {
  it('exposes summary with stats and meta', () => {
    const report = load(basicFixture);
    const index = buildIndex(report);
    const selectors = createSelectors(report, index);

    const summary = selectors.getSummary();
    expect(summary.stats.tests).toBe(3);
    expect(summary.stats.failures).toBe(1);
    expect(summary.meta.runner.name).toBe('mocha');
    expect(summary.meta.reporter.name).toBe('mochawesome');
  });

  it('builds a suite tree with aggregated counts', () => {
    const report = load(basicFixture);
    const index = buildIndex(report);
    const selectors = createSelectors(report, index);

    const tree = selectors.getSuiteTree();
    expect(tree.id).toBe('s0');
    expect(tree.counts.suites).toBe(3);
    expect(tree.counts.tests).toBe(3);
    expect(tree.counts.failures).toBe(1);
    expect(tree.counts.pending).toBe(1);
    expect(tree.children[0].title).toBe('outer');
    expect(tree.children[0].children[0].title).toBe('inner');
  });

  it('tracks hook failures separately from test failures', () => {
    const report = load(hookFailFixture);
    const index = buildIndex(report);
    const selectors = createSelectors(report, index);

    const tree = selectors.getSuiteTree();
    expect(tree.counts.failures).toBe(1);
    expect(tree.counts.failuresByType.hooks).toBe(1);
    expect(tree.counts.failuresByType.tests).toBe(0);
  });

  it('keeps skipped tests in tree counts', () => {
    const report = load(skipFixture);
    const index = buildIndex(report);
    const selectors = createSelectors(report, index);

    const tree = selectors.getSuiteTree();
    expect(tree.counts.tests).toBe(2);
    expect(tree.counts.skipped).toBe(1);
  });

  it('exposes node lookup and path helpers', () => {
    const report = load(basicFixture);
    const index = buildIndex(report);
    const selectors = createSelectors(report, index);

    const node = selectors.getNode('t0.1.1.1');
    expect(node?.kind).toBe('test');

    const path = selectors.getPath('t0.1.1.1');
    expect(path.map(entry => entry.id)).toEqual(['s0', 's0.1', 's0.1.1', 't0.1.1.1']);

    const children = selectors.getChildren('s0.1.1');
    expect(children.map(child => child.id)).toEqual([
      't0.1.1.1',
      't0.1.1.2',
      't0.1.1.3',
      'h0.1.1.1',
    ]);
  });
});
