'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');
var chalk = require('chalk');
var uuid = require('uuid');
var mochaUtils = require('mocha/lib/utils');
var stringify = require('json-stringify-safe');
var diff = require('diff');

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
  var logMethod = console[level] || console.log;
  var out = msg;
  if ((typeof msg === 'undefined' ? 'undefined' : (0, _typeof3.default)(msg)) === 'object') {
    out = stringify(msg, null, 2);
  }
  logMethod('[' + chalk.gray('mochawesome') + '] ' + out + '\n');
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
  _.forOwn(obj, function (val, prop) {
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
  str = str.replace(/\r\n?|[\n\u2028\u2029]/g, '\n').replace(/^\uFEFF/, '').replace(/^function\s*\(.*\)\s*{|\(.*\)\s*=>\s*{?/, '').replace(/\s*\}$/, '');

  var spaces = str.match(/^\n?( *)/)[1].length;
  var tabs = str.match(/^\n?(\t*)/)[1].length;
  /* istanbul ignore next */
  var re = new RegExp('^\n?' + (tabs ? '\t' : ' ') + '{' + (tabs || spaces) + '}', 'gm');

  str = str.replace(re, '');
  str = str.replace(/^\s+|\s+$/g, '');
  return str;
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 *
 * @return {Object} cleaned test
 */
function cleanTest(test) {
  /**
   * Check that a / b have the same type.
   */
  function sameType(a, b) {
    var objToString = Object.prototype.toString;
    return objToString.call(a) === objToString.call(b);
  }

  /* istanbul ignore next: test.fn exists prior to mocha 2.4.0 */
  var code = test.fn ? test.fn.toString() : test.body;
  var err = test.err || {};
  var actual = err.actual,
      expected = err.expected,
      showDiff = err.showDiff,
      stack = err.stack;


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
    err.diff = diff.createPatch('string', err.actual, err.expected).split('\n').splice(4).map(function (line) {
      if (line.match(/@@/)) {
        return null;
      }
      if (line.match(/\\ No newline/)) {
        return null;
      }
      return line.replace(/^(-|\+)/, '$1 ');
    }).filter(function (line) {
      return typeof line !== 'undefined' && line !== null;
    }).join('\n');
  }

  var cleaned = {
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
    code: code,
    err: err,
    isRoot: test.parent && test.parent.root,
    uuid: test.uuid || /* istanbul ignore next: default */uuid.v4(),
    parentUUID: test.parent && test.parent.uuid,
    isHook: test.type === 'hook'
  };

  cleaned.skipped = !cleaned.pass && !cleaned.fail && !cleaned.pending && !cleaned.isHook;

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
function cleanSuite(suite, totalTestsRegistered) {
  suite.uuid = uuid.v4();
  var beforeHooks = _.map([].concat(suite._beforeAll, suite._beforeEach), cleanTest);
  var afterHooks = _.map([].concat(suite._afterAll, suite._afterEach), cleanTest);
  var cleanTests = _.map(suite.tests, cleanTest);
  var passingTests = _.filter(cleanTests, { state: 'passed' });
  var failingTests = _.filter(cleanTests, { state: 'failed' });
  var pendingTests = _.filter(cleanTests, { pending: true });
  var skippedTests = _.filter(cleanTests, { skipped: true });
  var duration = 0;

  _.each(cleanTests, function (test) {
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

  removeAllPropsFromObjExcept(suite, ['title', 'fullFile', 'file', 'beforeHooks', 'afterHooks', 'tests', 'suites', 'passes', 'failures', 'pending', 'skipped', 'hasBeforeHooks', 'hasAfterHooks', 'hasTests', 'hasSuites', 'totalTests', 'totalPasses', 'totalFailures', 'totalPending', 'totalSkipped', 'hasPasses', 'hasFailures', 'hasPending', 'hasSkipped', 'root', 'uuid', 'duration', 'rootEmpty', '_timeout']);
}

/**
 * Do a breadth-first search to find
 * and format all nested 'suite' objects.
 *
 * @param {Object} suite
 * @param {Object} totalTestsRegistered
 * @param {Integer} totalTestsRegistered.total
 */
function traverseSuites(suite, totalTestsRegistered) {
  var queue = [];
  var next = suite;
  while (next) {
    if (next.root) {
      cleanSuite(next, totalTestsRegistered);
    }
    if (next.suites.length) {
      _.each(next.suites, function (nextSuite, i) {
        cleanSuite(nextSuite, totalTestsRegistered);
        queue.push(nextSuite);
      });
    }
    next = queue.shift();
  }
}

module.exports = {
  log: log,
  getPercentClass: getPercentClass,
  removeAllPropsFromObjExcept: removeAllPropsFromObjExcept,
  cleanCode: cleanCode,
  cleanTest: cleanTest,
  cleanSuite: cleanSuite,
  traverseSuites: traverseSuites
};