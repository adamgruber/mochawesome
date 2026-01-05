import type {
  ErrorInfo,
  Hook,
  Report,
  Suite,
  Test,
  Timing,
} from '../../../mochawesome/src/core/model';

export type NodeKind = 'suite' | 'test' | 'hook';
export type Node = Suite | Test | Hook;

export type NodeRecord = {
  id: string;
  kind: NodeKind;
  node: Node;
};

export type Attempt = {
  id: string;
  state: Test['state'];
  timing: Timing;
  error?: ErrorInfo;
  attempt?: Test['attempt'];
};

export type Index = {
  byId: Map<string, NodeRecord>;
  parentById: Map<string, string>;
  childrenById: Map<string, string[]>;
  pathById: Map<string, string[]>;
  stableKeyById: Map<string, string>;
  failures: string[];
  pending: string[];
  skipped: string[];
  attemptsByTestId: Map<string, Attempt[]>;
};

export type ReportModel = Report;
