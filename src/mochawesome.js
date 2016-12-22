const fs = require('fs-extra');
const mocha = require('mocha');
const mochaUtils = require('mocha/lib/utils');
const _ = require('lodash');
const uuid = require('uuid');
const chalk = require('chalk');
const stringify = require('json-stringify-safe');
const conf = require('./config');
const diff = require('diff');
const marge = require('mochawesome-report-generator');

// Track the total number of tests registered
let totalTestsRegistered;


/**
 * HELPER FUNCTIONS
 */

function log(msg, level, config) {
  // Don't log messages in quiet mode
  if (config && config.quiet) return;
  const logMethod = console[level] || console.log;
  let out = msg;
  if (typeof msg === 'object') {
    out = stringify(msg, null, 2);
  }
  logMethod(`[${chalk.gray('mochawesome')}] ${out}\n`);
}

/**
 * Return a classname based on percentage
 *
 * @param {Integer} pct
 * @api private
 */

function _getPercentClass(pct) {
  if (pct <= 50) {
    return 'danger';
  } else if (pct > 50 && pct < 80) {
    return 'warning';
  } else {
    return 'success';
  }
}

/**
 * Remove all properties from an object except
 * those that are in the propsToKeep array.
 *
 * @param {Object} obj
 * @param {Array} propsToKeep
 * @api private
 */

function removeAllPropsFromObjExcept(obj, propsToKeep) {
  _.forOwn(obj, (val, prop) => {
    if (propsToKeep.indexOf(prop) === -1) {
      delete obj[prop];
    }
  });
}

/**
 * Check that a / b have the same type.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {boolean}
 */
function sameType(a, b) {
  const objToString = Object.prototype.toString;
  return objToString.call(a) === objToString.call(b);
}

/**
 * Strip the function definition from `str`,
 * and re-indent for pre whitespace.
 */

function cleanCode(str) {
  str = str
    .replace(/\r\n?|[\n\u2028\u2029]/g, '\n').replace(/^\uFEFF/, '')
    .replace(/^function *\(.*\) *{|\(.*\) *=> *{?/, '')
    .replace(/\s+\}$/, '');

  const spaces = str.match(/^\n?( *)/)[1].length;
  const tabs = str.match(/^\n?(\t*)/)[1].length;
  /* istanbul ignore next */
  const re = new RegExp(`^\n?${tabs ? '\t' : ' '}{${tabs || spaces}}`, 'gm');

  str = str.replace(re, '');
  str = str.replace(/^\s+|\s+$/g, '');
  return str;
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function cleanTest(test) {
  /* istanbul ignore next: test.fn exists prior to mocha 2.4.0 */
  let code = test.fn ? test.fn.toString() : test.body;
  const err = test.err || {};
  const { actual, expected, showDiff, stack } = err;

  if (code) {
    code = cleanCode(code);
  }

  if (stack) {
    err.estack = err.stack;
  }

  // Create diff for the error
  if (showDiff !== false && sameType(actual, expected) && expected !== undefined) {
    /* istanbul ignore if */
    if (!(_.isString(actual) && _.isString(expected))) {
      err.actual = mochaUtils.stringify(actual);
      err.expected = mochaUtils.stringify(expected);
    }
    err.diff = diff
      .createPatch('string', err.actual, err.expected)
      .split('\n')
      .splice(4)
      .map(line => {
        if (line.match(/@@/)) {
          return null;
        }
        if (line.match(/\\ No newline/)) {
          return null;
        }
        return line.replace(/^(-|\+)/, '$1 ');
      })
      .filter(line => typeof line !== 'undefined' && line !== null)
      .join('\n');
  }

  const cleaned = {
    title: test.title,
    fullTitle: _.isFunction(test.fullTitle) ? test.fullTitle() : /* istanbul ignore next */test.title,
    timedOut: test.timedOut,
    duration: test.duration || 0,
    state: test.state,
    speed: test.speed,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    pending: test.pending,
    context: stringify(test.context, null, 2),
    code,
    err,
    isRoot: test.parent && test.parent.root,
    uuid: test.uuid || /* istanbul ignore next: default */uuid.v4(),
    parentUUID: test.parent && test.parent.uuid
  };

  cleaned.skipped = (!cleaned.pass && !cleaned.fail && !cleaned.pending);

  return cleaned;
}

/**
 * Modify the suite object to add properties needed to render
 * the template and remove properties we do not need.
 *
 * @param {Object} suite
 * @api private
 */

function cleanSuite(suite) {
  suite.uuid = uuid.v4();

  const cleanTests = _.map(suite.tests, cleanTest);
  const passingTests = _.filter(cleanTests, { state: 'passed' });
  const failingTests = _.filter(cleanTests, { state: 'failed' });
  const pendingTests = _.filter(cleanTests, { pending: true });
  const skippedTests = _.filter(cleanTests, { skipped: true });
  let duration = 0;

  _.each(cleanTests, test => {
    duration += test.duration;
  });

  totalTestsRegistered += suite.tests.length;

  suite.tests = cleanTests;
  suite.fullFile = suite.file || '';
  suite.file = suite.file ? suite.file.replace(process.cwd(), '') : '';
  suite.passes = passingTests;
  suite.failures = failingTests;
  suite.pending = pendingTests;
  suite.skipped = skippedTests;
  suite.hasTests = suite.tests.length > 0;
  suite.hasSuites = suite.suites.length > 0;
  suite.totalTests = suite.tests.length;
  suite.totalPasses = passingTests.length;
  suite.totalFailures = failingTests.length;
  suite.totalPending = pendingTests.length;
  suite.totalSkipped = skippedTests.length;
  suite.hasPasses = passingTests.length > 0;
  suite.hasFailures = failingTests.length > 0;
  suite.hasPending = pendingTests.length > 0;
  suite.hasSkipped = suite.skipped.length > 0;
  suite.duration = duration;

  if (suite.root) {
    suite.rootEmpty = suite.totalTests === 0;
  }

  removeAllPropsFromObjExcept(suite, [
    'title',
    'fullFile',
    'file',
    'tests',
    'suites',
    'passes',
    'failures',
    'pending',
    'skipped',
    'hasTests',
    'hasSuites',
    'totalTests',
    'totalPasses',
    'totalFailures',
    'totalPending',
    'totalSkipped',
    'hasPasses',
    'hasFailures',
    'hasPending',
    'hasSkipped',
    'root',
    'uuid',
    'duration',
    'rootEmpty',
    '_timeout'
  ]);
}

/**
 * Do a breadth-first search to find
 * and format all nested 'suite' objects.
 *
 * @param {Object} suite
 * @api private
 */

function traverseSuites(suite) {
  const queue = [];
  let next = suite;
  while (next) {
    if (next.root) {
      cleanSuite(next);
    }
    if (next.suites.length) {
      _.each(next.suites, (nextSuite, i) => {
        cleanSuite(nextSuite);
        queue.push(nextSuite);
      });
    }
    next = queue.shift();
  }
}

/**
 * Saves a file
 *
 * @param {String} filename
 * @param {String} data
 * @returns {Promise}
 */

function saveFile(filename, data) {
  return new Promise((resolve, reject) => {
    fs.outputFile(filename, data, err => err === null ? resolve(true) : reject(err));
  });
}

/**
 * Done function gets called before mocha exits
 *
 * @param {Object} output
 * @param {Object} config
 * @param {Function} exit
 */

async function done(output, config, exit) {
  const { reportJsonFile, reportHtmlFile } = config;
  try {
    // Save the JSON to disk
    await saveFile(reportJsonFile, output);
    log(`Report JSON saved to ${reportJsonFile}`, null, config);

    // Create and save the HTML to disk
    await marge.create(output, config);
    log(`Report HTML saved to ${reportHtmlFile}`, null, config);

    exit();
  } catch (err) {
    log(err, 'error', config);
    exit();
  }
}

/**
 * Initialize a new reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Mochawesome(runner, options) {
  // Done function will be called before mocha exits
  // This is where we will save JSON and generate the report
  this.done = (failures, exit) => done(this.output, this.config, exit);

  // Reset total tests counter
  totalTestsRegistered = 0;

  // Create/Save necessary report dirs/files
  const reporterOpts = (options && options.reporterOptions) || {};
  this.config = conf(reporterOpts);

  // Call the Base mocha reporter
  mocha.reporters.Base.call(this, runner);

  // Show the Spec Reporter in the console
  new mocha.reporters.Spec(runner); // eslint-disable-line

  const allTests = [];
  const allPending = [];
  const allFailures = [];
  const allPasses = [];
  let endCalled = false;

  // Add a unique identifier to each test
  runner.on('test', test => (test.uuid = uuid.v4()));

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

        traverseSuites(allSuites);

        const obj = {
          stats: this.stats,
          suites: allSuites,
          allTests: allTests.map(cleanTest),
          allPending: allPending.map(cleanTest),
          allPasses: allPasses.map(cleanTest),
          allFailures: allFailures.map(cleanTest),
          copyrightYear: new Date().getFullYear()
        };

        obj.stats.testsRegistered = totalTestsRegistered;

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
        obj.stats.passPercentClass = _getPercentClass(passPercentage);
        obj.stats.pendingPercentClass = _getPercentClass(pendingPercentage);

        // Save the final output to be used in the done function
        this.output = stringify(obj, null, 2);
      }
    } catch (e) {
      // required because thrown errors are not handled directly in the
      // event emitter pattern and mocha does not have an "on error"
      /* istanbul ignore next */
      console.error(`Problem with mochawesome: ${e.stack}`);
    }
  });
}

module.exports = Mochawesome;
