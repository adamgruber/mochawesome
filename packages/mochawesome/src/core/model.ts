import { hookId, suiteChildId, suiteId, testId } from './id';

export type Timing = {
  start: string;
  end: string;
  durationMs: number;
};

export type Stats = {
  suites: number;
  tests: number;
  passes: number;
  failures: number;
  failuresByType?: {
    tests: number;
    hooks: number;
  };
  pending: number;
  skipped: number;
  start: string;
  end: string;
  durationMs: number;
};

export type Attachment = {
  kind: 'screenshot' | 'video' | 'log' | 'link' | 'file' | 'text';
  name?: string;
  path?: string;
  url?: string;
  mimeType?: string;
  content?: string;
  encoding?: 'utf8' | 'base64';
};

export type ErrorInfo = {
  name?: string;
  message: string;
  stack?: string;
  actual?: unknown;
  expected?: unknown;
  operator?: string;
};

export type Test = {
  id: string;
  stableKey?: string;
  title: string;
  fullTitle: string;
  file?: string;
  state: 'passed' | 'failed' | 'pending' | 'skipped';
  timing: Timing;
  speed?: 'fast' | 'medium' | 'slow';
  attempt?: {
    current: number;
    total?: number;
    retry?: boolean;
  };
  error?: ErrorInfo;
  attachments?: Attachment[];
  tags?: string[];
  extra?: Record<string, unknown>;
};

export type Hook = {
  id: string;
  stableKey?: string;
  type: 'before' | 'beforeEach' | 'afterEach' | 'after';
  title: string;
  state: 'passed' | 'failed' | 'pending' | 'skipped';
  timing: Timing;
  error?: ErrorInfo;
  attachments?: Attachment[];
  extra?: Record<string, unknown>;
};

export type Suite = {
  id: string;
  stableKey?: string;
  title: string;
  fullTitle: string;
  file?: string;
  timing: Timing;
  stats?: Stats;
  suites: Suite[];
  tests: Test[];
  hooks: Hook[];
  tags?: string[];
  extra?: Record<string, unknown>;
};

export type SchemaInfo = {
  name: 'mochawesome-report';
  version: string;
};

export type Meta = {
  generatedAt: string;
  durationMs: number;
  runner: { name: string; version: string };
  reporter: { name: 'mochawesome'; version: string };
  output: {
    reportDir: string;
    htmlFile: string;
    jsonFile: string;
    assetsDir: string;
    assetMode: 'inline' | 'folder';
    attachmentMode: 'link' | 'embed';
  };
  ci?: Record<string, unknown>;
  platform?: Record<string, unknown>;
};

export type Report = {
  schema: SchemaInfo;
  meta: Meta;
  stats: Stats;
  rootSuite: Suite;
  environment?: Record<string, unknown>;
  files?: string[];
  warnings?: string[];
};

export type SuiteInput = Omit<
  Suite,
  'id' | 'suites' | 'tests' | 'hooks' | 'stats'
> & { stats?: Stats };

export type TestInput = Omit<Test, 'id'>;
export type HookInput = Omit<Hook, 'id'>;

function buildSuite(id: string, input: SuiteInput): Suite {
  return {
    id,
    title: input.title,
    fullTitle: input.fullTitle,
    timing: input.timing,
    suites: [],
    tests: [],
    hooks: [],
    ...(input.stableKey ? { stableKey: input.stableKey } : {}),
    ...(input.file ? { file: input.file } : {}),
    ...(input.stats ? { stats: input.stats } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
    ...(input.extra ? { extra: input.extra } : {}),
  };
}

export function createRootSuite(input: SuiteInput): Suite {
  return buildSuite(suiteId([0]), input);
}

export function addSuite(parent: Suite, input: SuiteInput): Suite {
  const index = parent.suites.length + 1;
  const suite = buildSuite(suiteChildId(parent.id, index), input);
  parent.suites.push(suite);
  return suite;
}

export function addTest(parent: Suite, input: TestInput): Test {
  const index = parent.tests.length + 1;
  const test: Test = {
    id: testId(parent.id, index),
    title: input.title,
    fullTitle: input.fullTitle,
    state: input.state,
    timing: input.timing,
    ...(input.stableKey ? { stableKey: input.stableKey } : {}),
    ...(input.file ? { file: input.file } : {}),
    ...(input.speed ? { speed: input.speed } : {}),
    ...(input.attempt ? { attempt: input.attempt } : {}),
    ...(input.error ? { error: input.error } : {}),
    ...(input.attachments ? { attachments: input.attachments } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
    ...(input.extra ? { extra: input.extra } : {}),
  };
  parent.tests.push(test);
  return test;
}

export function addHook(parent: Suite, input: HookInput): Hook {
  const index = parent.hooks.length + 1;
  const hook: Hook = {
    id: hookId(parent.id, index),
    type: input.type,
    title: input.title,
    state: input.state,
    timing: input.timing,
    ...(input.stableKey ? { stableKey: input.stableKey } : {}),
    ...(input.error ? { error: input.error } : {}),
    ...(input.attachments ? { attachments: input.attachments } : {}),
    ...(input.extra ? { extra: input.extra } : {}),
  };
  parent.hooks.push(hook);
  return hook;
}

export function createReport(input: {
  schemaVersion: string;
  meta: Meta;
  stats: Stats;
  rootSuite: Suite;
  environment?: Record<string, unknown>;
  files?: string[];
  warnings?: string[];
}): Report {
  return {
    schema: { name: 'mochawesome-report', version: input.schemaVersion },
    meta: input.meta,
    stats: input.stats,
    rootSuite: input.rootSuite,
    ...(input.environment ? { environment: input.environment } : {}),
    ...(input.files ? { files: input.files } : {}),
    ...(input.warnings ? { warnings: input.warnings } : {}),
  };
}
