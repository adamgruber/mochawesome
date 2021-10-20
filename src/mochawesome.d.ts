// Type definitions for mochawesome 7.0
// Project: https://github.com/adamgruber/mochawesome
// Definitions by: Adam Gruber <https://adamgruber.com>

declare namespace Mochawesome {
  interface ReporterOptions {
    'no-code': boolean;
    code: boolean;
    consoleReporter: string;
    html: boolean;
    json: boolean;
    quiet: boolean;
    reportFilename: string;
  }

  interface Options {
    inlineDiffs?: boolean;
    reporterOptions: Partial<ReporterOptions>;
  }

  interface Config {
    code: boolean;
    consoleReporter: string;
    quiet: boolean;
    reportFilename: string;
    saveHtml: boolean;
    saveJson: boolean;
    useInlineDiffs: boolean;
  }

  interface OutputMeta {
    mocha: {
      version: string;
    };
    mochawesome: {
      options: Config;
      version: string;
    };
    marge: {
      options: Partial<ReporterOptions>;
      version: string;
    };
  }

  interface Stats {
    suites: number;
    tests: number;
    passed: number;
    failed: number;
    skipped: number;
    failedHooks: number;
  }

  type Results = {
    suites: {
      [key: string]: ProcessedSuite;
    };
    tests: {
      [key: string]: ProcessedTest;
    };
    hooks: {
      [key: string]: ProcessedTest;
    };
  };

  interface MargeOptions {
    reportFilename: string;
    saveHtml: boolean;
    saveJson: boolean;
  }

  interface Suite extends Mocha.Suite {
    [key: string]: Mocha.Hook[];
  }

  interface ProcessedSuite {
    id: string;
    title: string;
    fullFile: string | undefined;
    file: string | undefined;
    duration: number;
    isRoot: boolean;
    parent?: string;
  }

  type Context = {
    title: string;
    value: string | number;
  };

  type ContextArg = string | Context;

  type TestType =
    | 'test'
    | 'beforeEach'
    | 'beforeAll'
    | 'afterEach'
    | 'afterAll';

  interface ProcessedTest {
    id: string;
    title: string;
    fullTitle: string;
    duration: number;
    timeout: number;
    timedOut: boolean;
    retries?: number;
    state?: 'failed' | 'passed' | 'pending' | 'didNotRun';
    speed?: 'slow' | 'medium' | 'fast';
    context?: string | Context;
    code?: string;
    err?: NormalizedError;
    parent?: string;
    type: TestType;
  }
}

// Create our own Mocha Types with properties used by the reporter
type MochaSuite = Omit<
  Mocha.Suite,
  | 'tests'
  | 'suites'
  | '_beforeEach'
  | '_beforeAll'
  | '_afterEach'
  | '_afterAll'
  | 'parent'
> & {
  id: string;
  tests: MochaTest[];
  suites: MochaSuite[];
  parent: MochaSuite | undefined;
  _beforeEach: MochaHook[];
  _beforeAll: MochaHook[];
  _afterEach: MochaHook[];
  _afterAll: MochaHook[];
};

type MochaTest = Omit<Mocha.Test, 'parent'> & {
  id: string;
  context?: Mochawesome.Context[];
  parent?: MochaSuite;
  type: 'test';
};

type MochaHook = Omit<Mocha.Hook, 'parent'> & {
  id: string;
  context?: Mochawesome.Context[];
  parent?: MochaSuite;
  err?: Error | undefined;
  type: 'hook';
};

type MochaRunnable = {
  currentTest?: MochaTest | MochaHook;
  test?: MochaTest | MochaHook;
};

type AssertionError = import('assert').AssertionError;

type MochaError = Partial<AssertionError> & {
  showDiff?: boolean;
};
