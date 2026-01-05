import type {
  Meta,
  Stats,
  Suite,
} from '../../../../mochawesome/src/core/model';

export type Summary = {
  stats: Stats;
  meta: {
    generatedAt: string;
    durationMs: number;
    runner: Meta['runner'];
    reporter: Meta['reporter'];
    output: Meta['output'];
  };
  warnings: string[];
};

export type SuiteCounts = {
  suites: number;
  tests: number;
  hooks: number;
  passes: number;
  failures: number;
  pending: number;
  skipped: number;
  failuresByType: {
    tests: number;
    hooks: number;
  };
};

export type SuiteTreeItem = {
  id: string;
  title: string;
  fullTitle: string;
  suite: Suite;
  counts: SuiteCounts;
  children: SuiteTreeItem[];
};
