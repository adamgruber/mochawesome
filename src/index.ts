import Base from 'mocha/lib/reporters/base';
import mochaPkg from 'mocha/package.json';
import uuid from 'uuid';
import marge from 'mochawesome-report-generator';
import margePkg from 'mochawesome-report-generator/package.json';
import conf from './config';
import utils from './utils';
import pkg from '../package.json';
import Mocha from 'mocha';
const {
  EVENT_RUN_BEGIN,
  EVENT_HOOK_END,
  EVENT_SUITE_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_PENDING,
  EVENT_SUITE_END,
} = Mocha.Runner.constants;

// Import the utility functions
const { log, mapSuites } = utils;

// Track the total number of tests registered/skipped
const testTotals = {
  registered: 0,
  skipped: 0,
};

/**
 * Done function gets called before mocha exits
 *
 * Creates and saves the report HTML and JSON files
 *
 * @param {Object} output    Final report object
 * @param {Object} options   Options to pass to report generator
 * @param {Object} config    Reporter config object
 * @param {Number} failures  Number of reported failures
 * @param {Function} exit
 *
 * @return {Promise} Resolves with successful report creation
 */
function done(output, options, config, failures, exit) {
  return marge
    .create(output, options)
    .then(([htmlFile, jsonFile]) => {
      if (!htmlFile && !jsonFile) {
        log('No files were generated', 'warn', config);
      } else {
        jsonFile && log(`Report JSON saved to ${jsonFile}`, null, config);
        htmlFile && log(`Report HTML saved to ${htmlFile}`, null, config);
      }
    })
    .catch(err => {
      log(err, 'error', config);
    })
    .then(() => {
      exit && exit(failures > 0 ? 1 : 0);
    });
}

/**
 * Mochawesome Reporter
 */
class Mochawesome {
  config: Mochawesome.Config;
  constructor(runner: Mocha.Runner, options: Mochawesome.Options) {
    // Call the Base mocha reporter
    Base.call(this, runner, options);

    // Set the config options
    this.config = conf(options);

    // Ensure stats collector has been initialized
    if (!runner.stats) {
      const createStatsCollector = require('mocha/lib/stats-collector');
      createStatsCollector(runner);
    }

    // Reporter options
    this.reporterOptions = {
      ...options.reporterOptions,
      reportFilename: this.config.reportFilename,
      saveHtml: this.config.saveHtml,
      saveJson: this.config.saveJson,
    };

    // Reset total tests counters
    testTotals.registered = 0;
    testTotals.skipped = 0;

    this.initConsoleReporter(runner, options);
    this.attachEvents(runner);

    // Handle events from workers in parallel mode
    if (runner.constructor.name === 'ParallelBufferedRunner') {
      this.attatchEventsForParallelMode(runner);
    }
  }

  /**
   * Initialize a reporter to output to the console while mocha is running
   * and before mochawesome generates its own report.
   */
  initConsoleReporter(runner: Mocha.Runner, options: Mochawesome.Options) {
    const { consoleReporter } = this.config;
    if (consoleReporter !== 'none') {
      let ConsoleReporter;
      try {
        ConsoleReporter = require(`mocha/lib/reporters/${consoleReporter}`);
      } catch (e) {
        log(`Unknown console reporter '${consoleReporter}'`);
      }
      if (ConsoleReporter) {
        new ConsoleReporter(runner, options); // eslint-disable-line
      }
    }
  }

  attachEvents(runner: Mocha.Runner) {
    let endCalled = false;

    // Add a unique identifier to each suite/test/hook
    ['suite', 'test', 'hook', 'pending'].forEach(type => {
      runner.on(type, item => {
        item.uuid = uuid.v4();
      });
    });

    // Process the full suite
    runner.on('end', () => {
      try {
        /* istanbul ignore else */
        if (!endCalled) {
          // end gets called more than once for some reason
          // so we ensure the suite is processed only once
          endCalled = true;

          const rootSuite = mapSuites(
            this.runner.suite,
            testTotals,
            this.config
          );

          const obj = {
            stats: this.stats,
            results: [rootSuite],
            meta: {
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
            },
          };

          obj.stats.testsRegistered = testTotals.registered;

          const {
            passes,
            failures,
            pending,
            tests,
            testsRegistered,
          } = obj.stats;
          const passPercentage = (passes / (testsRegistered - pending)) * 100;
          const pendingPercentage = (pending / testsRegistered) * 100;

          obj.stats.passPercent = passPercentage;
          obj.stats.pendingPercent = pendingPercentage;
          obj.stats.other = passes + failures + pending - tests; // Failed hooks
          obj.stats.hasOther = obj.stats.other > 0;
          obj.stats.skipped = testTotals.skipped;
          obj.stats.hasSkipped = obj.stats.skipped > 0;
          obj.stats.failures -= obj.stats.other;

          // Save the final output to be used in the done function
          this.output = obj;
        }
      } catch (e) {
        // required because thrown errors are not handled directly in the
        // event emitter pattern and mocha does not have an "on error"
        /* istanbul ignore next */
        log(`Problem with mochawesome: ${e.stack}`, 'error');
      }
    });
  }

  attatchEventsForParallelMode(runner: Mocha.Runner) {
    let currentSuite;

    const HookMap = {
      ['"before all" ']: '_beforeAll',
      ['"before each" ']: '_beforeEach',
      ['"after each" ']: '_afterEach',
      ['"after all" ']: '_afterAll',
    };

    runner.on(EVENT_RUN_BEGIN, function () {
      currentSuite = undefined;
    });

    runner.on(EVENT_SUITE_BEGIN, function (suite) {
      suite._beforeAll = suite._beforeAll || [];
      suite._beforeEach = suite._beforeEach || [];
      suite.suites = suite.suites || [];
      suite.tests = suite.tests || [];
      suite._afterEach = suite._afterEach || [];
      suite._afterAll = suite._afterAll || [];
      if (suite.root) {
        suite = runner.suite;
      } else if (currentSuite) {
        currentSuite.suites.push(suite);
        suite.parent = currentSuite;
      }
      currentSuite = suite;
    });

    runner.on(EVENT_SUITE_END, function () {
      if (currentSuite) {
        currentSuite = currentSuite.parent;
      }
    });

    runner.on(EVENT_HOOK_END, function (hook) {
      if (currentSuite) {
        const hooks = currentSuite[HookMap[hook.title.split('hook')[0]]];
        // add only once, since it is attached to the Suite
        if (hooks && hooks.every(it => it.title !== hook.title)) {
          hook.parent = currentSuite;
          hooks.push(hook);
        }
      }
    });

    [EVENT_TEST_PASS, EVENT_TEST_FAIL, EVENT_TEST_PENDING].forEach(type => {
      runner.on(type, function (test) {
        if (currentSuite) {
          test.parent = currentSuite;
          if (test.type === 'hook') {
            const hooks = currentSuite[HookMap[test.title.split('hook')[0]]];
            hooks && hooks.push(test);
          } else {
            currentSuite.tests.push(test);
          }
        }
      });
    });
  }

  // Done function will be called before mocha exits
  // This is where we will save JSON and generate the HTML report
  done(failures: number, exit: (failures: number) => void) {
    done(this.output, this.reporterOptions, this.config, failures, exit);
  }
}

module.exports = Mochawesome;
