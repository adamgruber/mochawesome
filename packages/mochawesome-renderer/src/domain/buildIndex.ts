import type { Hook, Report, Suite, Test } from '../../../mochawesome/src/core/model';
import type { Attempt, Index, NodeKind, NodeRecord } from './types';

const createNodeRecord = (
  kind: NodeKind,
  node: Suite | Test | Hook
): NodeRecord => ({
  id: node.id,
  kind,
  node,
});

const collectState = (
  node: Test | Hook,
  failures: string[],
  pending: string[],
  skipped: string[]
) => {
  if (node.state === 'failed') failures.push(node.id);
  if (node.state === 'pending') pending.push(node.id);
  if (node.state === 'skipped') skipped.push(node.id);
};

export const buildIndex = (report: Report): Index => {
  const byId = new Map<string, NodeRecord>();
  const parentById = new Map<string, string>();
  const childrenById = new Map<string, string[]>();
  const pathById = new Map<string, string[]>();
  const stableKeyById = new Map<string, string>();
  const failures: string[] = [];
  const pending: string[] = [];
  const skipped: string[] = [];
  const attemptsByTestId = new Map<string, Attempt[]>();

  const setStableKey = (node: Suite | Test | Hook) => {
    if (node.stableKey) stableKeyById.set(node.id, node.stableKey);
  };

  const addRecord = (
    record: NodeRecord,
    parentId: string | null,
    path: string[]
  ) => {
    byId.set(record.id, record);
    if (parentId) parentById.set(record.id, parentId);
    pathById.set(record.id, path);
    setStableKey(record.node);
  };

  const visitSuite = (suite: Suite, parentId: string | null, path: string[]) => {
    addRecord(createNodeRecord('suite', suite), parentId, path);

    const childIds: string[] = [];

    for (const childSuite of suite.suites) {
      childIds.push(childSuite.id);
      visitSuite(childSuite, suite.id, [...path, childSuite.id]);
    }

    for (const test of suite.tests) {
      childIds.push(test.id);
      addRecord(createNodeRecord('test', test), suite.id, [...path, test.id]);
      collectState(test, failures, pending, skipped);
      attemptsByTestId.set(test.id, [
        {
          id: test.id,
          state: test.state,
          timing: test.timing,
          ...(test.error ? { error: test.error } : {}),
          ...(test.attempt ? { attempt: test.attempt } : {}),
        },
      ]);
    }

    for (const hook of suite.hooks) {
      childIds.push(hook.id);
      addRecord(createNodeRecord('hook', hook), suite.id, [...path, hook.id]);
      collectState(hook, failures, pending, skipped);
    }

    childrenById.set(suite.id, childIds);
  };

  const root = report.rootSuite;
  visitSuite(root, null, [root.id]);

  return {
    byId,
    parentById,
    childrenById,
    pathById,
    stableKeyById,
    failures,
    pending,
    skipped,
    attemptsByTestId,
  };
};
