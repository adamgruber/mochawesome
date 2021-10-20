import Mocha from 'mocha';
import mochaPkg from 'mocha/package.json';
import marge from 'mochawesome-report-generator';
import margePkg from 'mochawesome-report-generator/package.json';
import conf from './config';
import RunProcessor from './processor';
import Logger from './logger';
import pkg from '../package.json';

const {
  EVENT_RUN_BEGIN,
  EVENT_HOOK_END,
  EVENT_SUITE_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_PENDING,
  EVENT_SUITE_END,
  EVENT_RUN_END,
} = Mocha.Runner.constants;

/**
 * Mochawesome Reporter
 */
class Mochawesome extends Mocha.reporters.Base {
  config: Mochawesome.Config;
  currentSuite: Mochawesome.Suite | undefined;
  logger: Logger;
  margeOptions: Mochawesome.MargeOptions;
  meta: Mochawesome.OutputMeta;
  options: Mochawesome.Options;
  reporterStats: Mochawesome.Stats | null;
  results: Mochawesome.Results;
  totals: { registered: number; skipped: number };

  constructor(runner: Mocha.Runner, options: Mochawesome.Options) {
    // Call the Base mocha reporter
    super(runner, options);

    // Save the options and get the reporter config
    this.options = options;
    this.config = conf(options);
    this.logger = new Logger(console, this.config);

    // Save metadata about the run
    this.meta = {
      mocha: {
        version: mochaPkg.version,
      },
      mochawesome: {
        options: this.config,
        version: pkg.version,
      },
      marge: {
        options: options.reporterOptions,
        version: margePkg.version,
      },
    };

    this.reporterStats = null;
    this.results = {
      suites: {},
      tests: {},
      hooks: {},
    };

    // Ensure stats collector has been initialized
    if (!runner.stats) {
      const createStatsCollector = require('mocha/lib/stats-collector');
      createStatsCollector(runner);
    }

    // Reporter options
    this.margeOptions = {
      ...options.reporterOptions,
      reportFilename: this.config.reportFilename,
      saveHtml: this.config.saveHtml,
      saveJson: this.config.saveJson,
    };

    // Reset total tests counters
    this.totals = {
      registered: 0,
      skipped: 0,
    };

    this.initConsoleReporter();

    // Attach listener for run end event
    runner.on(EVENT_RUN_END, () => {
      try {
        this.handleEndEvent();
      } catch (err) {
        // required because thrown errors are not handled directly in the
        // event emitter pattern and mocha does not have an "on error"
        /* istanbul ignore next */
        this.logger.error(`Problem with mochawesome: ${(err as Error).stack}`);
      }
    });

    // Handle events from workers in parallel mode
    if (runner.constructor.name === 'ParallelBufferedRunner') {
      this.attatchEventsForParallelMode();
    }
  }

  /**
   * Initialize a reporter to output to the console while mocha is running
   * and before mochawesome generates its own report.
   */
  initConsoleReporter() {
    const { consoleReporter } = this.config;
    if (consoleReporter !== 'none') {
      let ConsoleReporter;
      try {
        ConsoleReporter = require(`mocha/lib/reporters/${consoleReporter}`);
      } catch (e) {
        this.logger.warn(`Unknown console reporter '${consoleReporter}'`);
      }
      if (ConsoleReporter) {
        new ConsoleReporter(this.runner, this.options); // eslint-disable-line
      }
    }
  }

  attatchEventsForParallelMode() {
    const HookMap: { [key: string]: string } = {
      '"before all" ': '_beforeAll',
      '"before each" ': '_beforeEach',
      '"after each" ': '_afterEach',
      '"after all" ': '_afterAll',
    };

    this.runner.on(EVENT_RUN_BEGIN, () => {
      this.currentSuite = undefined;
    });

    this.runner.on(EVENT_SUITE_BEGIN, suite => {
      suite['_beforeAll'] = suite['_beforeAll'] || [];
      suite['_beforeEach'] = suite['_beforeEach'] || [];
      suite.suites = suite.suites || [];
      suite.tests = suite.tests || [];
      suite['_afterEach'] = suite['_afterEach'] || [];
      suite['_afterAll'] = suite['_afterAll'] || [];
      if (suite.root) {
        suite = this.runner.suite;
      } else if (this.currentSuite) {
        this.currentSuite.suites.push(suite);
        suite.parent = this.currentSuite;
      }
      this.currentSuite = suite as Mochawesome.Suite;
    });

    this.runner.on(EVENT_SUITE_END, () => {
      if (this.currentSuite) {
        this.currentSuite = this.currentSuite.parent as Mochawesome.Suite;
      }
    });

    this.runner.on(EVENT_HOOK_END, hook => {
      if (this.currentSuite) {
        const hookType = HookMap[hook.title.split('hook')[0]];
        const hooks = this.currentSuite[hookType];
        // add only once, since it is attached to the Suite
        if (hooks && hooks.every((it: Mocha.Hook) => it.title !== hook.title)) {
          hook.parent = this.currentSuite;
          hooks.push(hook);
        }
      }
    });

    [EVENT_TEST_PASS, EVENT_TEST_FAIL, EVENT_TEST_PENDING].forEach(type => {
      this.runner.on(type, test => {
        if (this.currentSuite) {
          test.parent = this.currentSuite;
          if (test.type === 'hook') {
            const hookType = HookMap[test.title.split('hook')[0]];
            const hooks = this.currentSuite[hookType];
            hooks && hooks.push(test);
          } else {
            this.currentSuite.tests.push(test);
          }
        }
      });
    });
  }

  handleEndEvent() {
    const processor = new RunProcessor(this.runner.suite, this.config);
    this.results = processor.run();

    const { suites = 0, passes = 0, failures = 0, pending = 0, tests = 0 } =
      this.runner?.stats || {};
    const failedHooks = passes + failures + pending - tests;
    this.reporterStats = {
      suites,
      tests: this.totals.registered,
      passed: passes,
      failed: failures - failedHooks,
      skipped: pending,
      failedHooks,
    };
  }

  // Done function will be called before mocha exits
  // This is where we will save JSON and generate the HTML report
  async done(failures: number, exit: (failures: number) => void) {
    try {
      const [htmlFile, jsonFile] = await marge.create(
        {
          meta: this.meta,
          results: this.results,
          stats: this.stats,
        },
        this.margeOptions
      );
      if (!htmlFile && !jsonFile) {
        this.logger.warn('No files were generated');
      } else {
        jsonFile && this.logger.log(`Report JSON saved to ${jsonFile}`);
        htmlFile && this.logger.log(`Report HTML saved to ${htmlFile}`);
      }
    } catch (err) {
      this.logger.error(err as Error);
    }

    exit && exit(failures > 0 ? 1 : 0);
  }
}

export = Mochawesome;
