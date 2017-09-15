const Base = require('mocha/lib/reporters/base');
const Spec = require('mocha/lib/reporters/spec');
const uuid = require('uuid');
const stringify = require('json-stringify-safe');
const conf = require('./config');
const marge = require('mochawesome-report-generator');
const utils = require('./utils');

// Import the utility functions
const {
  log,
  getPercentClass,
  cleanTest,
  traverseSuites
} = utils;

// Track the total number of tests registered
const totalTestsRegistered = { total: 0 };

/**
 * Done function gets called before mocha exits
 *
 * Creates and saves the report HTML and JSON files
 *
 * @param {Object} output
 * @param {Object} config
 * @param {Function} exit
 *
 * @return {Promise} Resolves with successful report creation
 */

function done(output, config, failures, exit) {
  return marge.create(output, config)
    .then(([ htmlFile, jsonFile ]) => {
      log(`Report JSON saved to ${jsonFile}`, null, config);
      log(`Report HTML saved to ${htmlFile}`, null, config);
    })
    .catch(err => {
      log(err, 'error', config);
    })
    .then(() => {
      exit && exit(failures);
    });
}

/**
 * Initialize a new reporter.
 *
 * @param {Runner} runner
 * @api public
 */
function Mochawesome(runner, options) {
  // Done function will be called before mocha exits
  // This is where we will save JSON and generate the HTML report
  this.done = (failures, exit) => done(this.output, this.config, failures, exit);

  // Reset total tests counter
  totalTestsRegistered.total = 0;

  // Set the config options
  this.config = conf(options);

  // Call the Base mocha reporter
  Base.call(this, runner);

  // Show the Spec Reporter in the console
  new Spec(runner); // eslint-disable-line

  const allTests = [];
  const allPending = [];
  const allFailures = [];
  const allPasses = [];
  let endCalled = false;

  // Add a unique identifier to each test/hook
  runner.on('test', test => (test.uuid = uuid.v4()));
  runner.on('hook', hook => (hook.uuid = uuid.v4()));
  // Add test to array of all tests
  runner.on('test end', test => allTests.push(test));

  // Add pending test to array of pending tests
  runner.on('pending', test => {
    test.uuid = uuid.v4();
    allPending.push(test);
  });

  // Add passing test to array of passing tests
  runner.on('pass', test => allPasses.push(test));

  // Add failed test to array of failed tests
  runner.on('fail', test => allFailures.push(test));

  // Process the full suite
  runner.on('end', () => {
    try {
      /* istanbul ignore else */
      if (!endCalled) {
        // end gets called more than once for some reason
        // so we ensure the suite is processed only once
        endCalled = true;

        const allSuites = this.runner.suite;

        traverseSuites(allSuites, totalTestsRegistered, this.config);

        const obj = {
          stats: this.stats,
          suites: allSuites,
          allTests: allTests.map(cleanTest),
          allPending: allPending.map(cleanTest),
          allPasses: allPasses.map(cleanTest),
          allFailures: allFailures.map(cleanTest),
          copyrightYear: new Date().getFullYear()
        };

        obj.stats.testsRegistered = totalTestsRegistered.total;

        const { passes, failures, pending, tests, testsRegistered } = obj.stats;
        const passPercentage = Math.round((passes / (testsRegistered - pending)) * 1000) / 10;
        const pendingPercentage = Math.round((pending / testsRegistered) * 1000) /10;

        obj.stats.passPercent = passPercentage;
        obj.stats.pendingPercent = pendingPercentage;
        obj.stats.other = (passes + failures + pending) - tests;
        obj.stats.hasOther = obj.stats.other > 0;
        obj.stats.skipped = testsRegistered - tests;
        obj.stats.hasSkipped = obj.stats.skipped > 0;
        obj.stats.failures -= obj.stats.other;
        obj.stats.passPercentClass = getPercentClass(passPercentage);
        obj.stats.pendingPercentClass = getPercentClass(pendingPercentage);

        // Save the final output to be used in the done function
        this.output = stringify(obj, null, 2);
      }
    } catch (e) {
      // required because thrown errors are not handled directly in the
      // event emitter pattern and mocha does not have an "on error"
      /* istanbul ignore next */
      log(`Problem with mochawesome: ${e.stack}`, 'error');
    }
  });
}

module.exports = Mochawesome;
