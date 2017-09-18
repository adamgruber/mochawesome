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
 * Remove all properties from an object except
 * those that are in the propsToKeep array.
 *
 * @param {Object} obj - object to remove props from
 * @param {Array} propsToKeep - properties to keep
 */
function removeAllPropsFromObjExcept(obj, propsToKeep) {
  _.forOwn(obj, (val, prop) => {
    if (propsToKeep.indexOf(prop) === -1) {
      delete obj[prop];
    }
  });
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
    .replace(/^function\*?\s*\(.*\)\s*{|\(.*\)\s*=>\s*{?/, '')
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
 * Mutates the suite object to add properties needed to render
 * the template and remove unused properties.
 *
 * @param {Object} suite
 * @param {Object} totalTestsRegistered
 * @param {Integer} totalTestsRegistered.total
 */
function cleanSuite(suite, totalTestsRegistered, config) {
  suite.uuid = uuid.v4();
  const beforeHooks = _.map([].concat(suite._beforeAll, suite._beforeEach), test => cleanTest(test, config));
  const afterHooks = _.map([].concat(suite._afterAll, suite._afterEach), test => cleanTest(test, config));
  const cleanTests = _.map(suite.tests, test => cleanTest(test, config));
  const passingTests = _.filter(cleanTests, { state: 'passed' });
  const failingTests = _.filter(cleanTests, { state: 'failed' });
  const pendingTests = _.filter(cleanTests, { pending: true });
  const skippedTests = _.filter(cleanTests, { skipped: true });
  let duration = 0;

  _.each(cleanTests, test => {
    duration += test.duration;
  });

  totalTestsRegistered.total += suite.tests.length;

  suite.beforeHooks = beforeHooks;
  suite.afterHooks = afterHooks;
  suite.tests = cleanTests;
  suite.fullFile = suite.file || '';
  suite.file = suite.file ? suite.file.replace(process.cwd(), '') : '';
  suite.passes = passingTests;
  suite.failures = failingTests;
  suite.pending = pendingTests;
  suite.skipped = skippedTests;
  suite.hasBeforeHooks = suite.beforeHooks.length > 0;
  suite.hasAfterHooks = suite.afterHooks.length > 0;
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
  suite.rootEmpty = suite.root && suite.totalTests === 0;

  removeAllPropsFromObjExcept(suite, [
    'title',
    'fullFile',
    'file',
    'beforeHooks',
    'afterHooks',
    'tests',
    'suites',
    'passes',
    'failures',
    'pending',
    'skipped',
    'hasBeforeHooks',
    'hasAfterHooks',
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
 * @param {Object} totalTestsRegistered
 * @param {Integer} totalTestsRegistered.total
 */
function traverseSuites(suite, totalTestsRegistered, config) {
  const queue = [];
  let next = suite;
  while (next) {
    if (next.root) {
      cleanSuite(next, totalTestsRegistered, config);
    }
    if (next.suites.length) {
      _.each(next.suites, (nextSuite, i) => {
        cleanSuite(nextSuite, totalTestsRegistered, config);
        queue.push(nextSuite);
      });
    }
    next = queue.shift();
  }
}

module.exports = {
  log,
  getPercentClass,
  removeAllPropsFromObjExcept,
  cleanCode,
  cleanTest,
  cleanSuite,
  traverseSuites
};
