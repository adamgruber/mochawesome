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
    suites: ProcessedSuite[];
    tests: ProcessedTest[];
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

  interface Context {}

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
