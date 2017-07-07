const _ = require('lodash');
const chalk = require('chalk');
const uuid = require('uuid');
const mochaUtils = require('mocha/lib/utils');
const stringify = require('json-stringify-safe');
const diff = require('diff');
const stripAnsi = require('strip-ansi');

/**
 * Return a classname based on percentage
 *
 * @param {String} msg - message to log
 * @param {String} level - log level [log, info, warn, error]
 * @param {Object} config - configuration object
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
 * @param {Integer} pct - percentage
 *
 * @return {String} classname
 */
function getPercentClass(pct) {
  if (pct <= 50) {
    return 'danger';
  } else if (pct > 50 && pct < 80) {
    return 'warning';
  } else {
    return 'success';
  }
}

/**
 * Strip the function definition from `str`,
 * and re-indent for pre whitespace.
 *
 * @param {String} str - code in
 *
 * @return {String} cleaned code string
 */
function cleanCode(str) {
  str = str
    .replace(/\r\n?|[\n\u2028\u2029]/g, '\n').replace(/^\uFEFF/, '')
    .replace(/^function\s*\(.*\)\s*{|\(.*\)\s*=>\s*{?/, '')
    .replace(/\s*\}$/, '');

  const spaces = str.match(/^\n?( *)/)[1].length;
  const tabs = str.match(/^\n?(\t*)/)[1].length;
  /* istanbul ignore next */
  const re = new RegExp(`^\n?${tabs ? '\t' : ' '}{${tabs || spaces}}`, 'gm');

  str = str.replace(re, '');
  str = str.replace(/^\s+|\s+$/g, '');
  return str;
}

/**
 * Create a unified diff between two strings
 *
 * @param {Error}  err          Error object
 * @param {string} err.actual   Actual result returned
 * @param {string} err.expected Result expected
 *
 * @return {string} diff
 */
function createUnifiedDiff({ actual, expected }) {
  return diff.createPatch('string', actual, expected)
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

/**
 * Create an inline diff between two strings
 *
 * @param {Error}  err          Error object
 * @param {string} err.actual   Actual result returned
 * @param {string} err.expected Result expected
 *
 * @return {array} diff string objects
 */
function createInlineDiff({ actual, expected }) {
  return diff.diffWordsWithSpace(actual, expected);
}

/**
 * Return a normalized error object
 *
 * @param {Error} err Error object
 *
 * @return {Object} normalized error
 */
function normalizeErr(err, config) {
  const { name, message, actual, expected, stack, showDiff } = err;
  let errMessage;
  let errDiff;

  /**
   * Check that a / b have the same type.
   */
  function sameType(a, b) {
    const objToString = Object.prototype.toString;
    return objToString.call(a) === objToString.call(b);
  }

  // Format actual/expected for creating diff
  if (showDiff !== false && sameType(actual, expected) && expected !== undefined) {
    /* istanbul ignore if */
    if (!(_.isString(actual) && _.isString(expected))) {
      err.actual = mochaUtils.stringify(actual);
      err.expected = mochaUtils.stringify(expected);
    }
    errDiff = config.useInlineDiffs ? createInlineDiff(err) : createUnifiedDiff(err);
  }

  // Assertion libraries do not output consitent error objects so in order to
  // get a consistent message object we need to create it ourselves
  if (name && message) {
    errMessage = `${name}: ${stripAnsi(message)}`;
  } else if (stack) {
    errMessage = stack.replace(/\n.*/g, '');
  }

  return {
    message: errMessage,
    estack: stack && stripAnsi(stack),
    diff: errDiff
  };
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 *
 * @return {Object} cleaned test
 */
function cleanTest(test, config) {
  /* istanbul ignore next: test.fn exists prior to mocha 2.4.0 */
  const code = test.fn ? test.fn.toString() : test.body;

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
    code: code && cleanCode(code),
    err: (test.err && normalizeErr(test.err, config)) || {},
    isRoot: test.parent && test.parent.root,
    uuid: test.uuid || /* istanbul ignore next: default */uuid.v4(),
    parentUUID: test.parent && test.parent.uuid,
    isHook: test.type === 'hook'
  };

  cleaned.skipped = (!cleaned.pass && !cleaned.fail && !cleaned.pending && !cleaned.isHook);

  return cleaned;
}

/**
 * Return a plain-object representation of `suite` with additional properties for rendering.
 *
 * @param {Object} suite
 * @param {Object} totalTestsRegistered
 * @param {Integer} totalTestsRegistered.total
 *
 * @return {Object|boolean} cleaned suite or false if suite is empty
 */
function cleanSuite(suite, totalTestsRegistered, config) {
  let duration = 0;
  const passingTests = [];
  const failingTests = [];
  const pendingTests = [];
  const skippedTests = [];

  const beforeHooks = _.map(
    [].concat(suite._beforeAll, suite._beforeEach),
    test => cleanTest(test, config)
  );

  const afterHooks = _.map(
    [].concat(suite._afterAll, suite._afterEach),
    test => cleanTest(test, config)
  );

  const tests = _.map(
    suite.tests,
    test => {
      const cleanedTest = cleanTest(test, config);
      duration += test.duration;
      if (cleanedTest.state === 'passed') passingTests.push(cleanedTest.uuid);
      if (cleanedTest.state === 'failed') failingTests.push(cleanedTest.uuid);
      if (cleanedTest.pending) pendingTests.push(cleanedTest.uuid);
      if (cleanedTest.skipped) skippedTests.push(cleanedTest.uuid);
      return cleanedTest;
    }
  );

  totalTestsRegistered.total += tests.length;

  const cleaned = {
    uuid: uuid.v4(),
    title: suite.title,
    fullFile: suite.file || '',
    file: suite.file ? suite.file.replace(process.cwd(), '') : '',
    beforeHooks,
    afterHooks,
    tests,
    suites: suite.suites,
    passes: passingTests,
    failures: failingTests,
    pending: pendingTests,
    skipped: skippedTests,
    duration,
    root: suite.root,
    rootEmpty: suite.root && tests.length === 0,
    _timeout: suite._timeout
  };

  const isEmptySuite = _.isEmpty(cleaned.suites)
    && _.isEmpty(cleaned.tests)
    && _.isEmpty(cleaned.beforeHooks)
    && _.isEmpty(cleaned.afterHooks);

  return !isEmptySuite && cleaned;
}

/**
 * Map over a suite, returning a cleaned suite object
 * and recursively cleaning any nested suites.
 *
 * @param {Object} suite          Suite to map over
 * @param {Object} totalTestsReg  Cumulative count of total tests registered
 * @param {Integer} totalTestsReg.total
 * @param {Object} config         Reporter configuration
 */
function mapSuites(suite, totalTestsReg, config) {
  const suites = _.compact(_.map(suite.suites, subSuite => (
      mapSuites(subSuite, totalTestsReg, config)
    )));
  const toBeCleaned = Object.assign({}, suite, { suites });
  return cleanSuite(toBeCleaned, totalTestsReg, config);
}

module.exports = {
  log,
  getPercentClass,
  cleanCode,
  cleanTest,
  cleanSuite,
  mapSuites
};
