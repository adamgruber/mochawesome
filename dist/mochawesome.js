'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

/**
 * Done function gets called before mocha exits
 *
 * @param {Object} output
 * @param {Object} config
 * @param {Function} exit
 */

var done = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(output, config, exit) {
    var reportJsonFile, reportHtmlFile;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            reportJsonFile = config.reportJsonFile, reportHtmlFile = config.reportHtmlFile;
            _context.prev = 1;
            _context.next = 4;
            return saveFile(reportJsonFile, output);

          case 4:
            log('Report JSON saved to ' + reportJsonFile, null, config);

            // Create and save the HTML to disk
            _context.next = 7;
            return marge.create(output, config);

          case 7:
            log('Report HTML saved to ' + reportHtmlFile, null, config);

            exit();
            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](1);

            log(_context.t0, 'error', config);
            exit();

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 11]]);
  }));

  return function done(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Initialize a new reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs-extra');
var mocha = require('mocha');
var mochaUtils = require('mocha/lib/utils');
var _ = require('lodash');
var uuid = require('uuid');
var chalk = require('chalk');
var stringify = require('json-stringify-safe');
var conf = require('./config');
var diff = require('diff');
var marge = require('mochawesome-report-generator');

// Track the total number of tests registered
var totalTestsRegistered = void 0;

/**
 * HELPER FUNCTIONS
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
  _.forOwn(obj, function (val, prop) {
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
  var objToString = Object.prototype.toString;
  return objToString.call(a) === objToString.call(b);
}

/**
 * Strip the function definition from `str`,
 * and re-indent for pre whitespace.
 */

function cleanCode(str) {
  str = str.replace(/\r\n?|[\n\u2028\u2029]/g, '\n').replace(/^\uFEFF/, '').replace(/^function *\(.*\) *{|\(.*\) *=> *{?/, '').replace(/\s+\}$/, '');

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
 * @return {Object}
 * @api private
 */

function cleanTest(test) {
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
    parentUUID: test.parent && test.parent.uuid
  };

  cleaned.skipped = !cleaned.pass && !cleaned.fail && !cleaned.pending;

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

  var cleanTests = _.map(suite.tests, cleanTest);
  var passingTests = _.filter(cleanTests, { state: 'passed' });
  var failingTests = _.filter(cleanTests, { state: 'failed' });
  var pendingTests = _.filter(cleanTests, { pending: true });
  var skippedTests = _.filter(cleanTests, { skipped: true });
  var duration = 0;

  _.each(cleanTests, function (test) {
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

  removeAllPropsFromObjExcept(suite, ['title', 'fullFile', 'file', 'tests', 'suites', 'passes', 'failures', 'pending', 'skipped', 'hasTests', 'hasSuites', 'totalTests', 'totalPasses', 'totalFailures', 'totalPending', 'totalSkipped', 'hasPasses', 'hasFailures', 'hasPending', 'hasSkipped', 'root', 'uuid', 'duration', 'rootEmpty', '_timeout']);
}

/**
 * Do a breadth-first search to find
 * and format all nested 'suite' objects.
 *
 * @param {Object} suite
 * @api private
 */

function traverseSuites(suite) {
  var queue = [];
  var next = suite;
  while (next) {
    if (next.root) {
      cleanSuite(next);
    }
    if (next.suites.length) {
      _.each(next.suites, function (nextSuite, i) {
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
  return new _promise2.default(function (resolve, reject) {
    fs.outputFile(filename, data, function (err) {
      return err === null ? resolve(true) : reject(err);
    });
  });
}function Mochawesome(runner, options) {
  var _this = this;

  // Done function will be called before mocha exits
  // This is where we will save JSON and generate the report
  this.done = function (failures, exit) {
    return done(_this.output, _this.config, exit);
  };

  // Reset total tests counter
  totalTestsRegistered = 0;

  // Create/Save necessary report dirs/files
  var reporterOpts = options && options.reporterOptions || {};
  this.config = conf(reporterOpts);

  // Call the Base mocha reporter
  mocha.reporters.Base.call(this, runner);

  // Show the Spec Reporter in the console
  new mocha.reporters.Spec(runner); // eslint-disable-line

  var allTests = [];
  var allPending = [];
  var allFailures = [];
  var allPasses = [];
  var endCalled = false;

  // Add a unique identifier to each test
  runner.on('test', function (test) {
    return test.uuid = uuid.v4();
  });

  // Add test to array of all tests
  runner.on('test end', function (test) {
    return allTests.push(test);
  });

  // Add pending test to array of pending tests
  runner.on('pending', function (test) {
    test.uuid = uuid.v4();
    allPending.push(test);
  });

  // Add passing test to array of passing tests
  runner.on('pass', function (test) {
    return allPasses.push(test);
  });

  // Add failed test to array of failed tests
  runner.on('fail', function (test) {
    return allFailures.push(test);
  });

  // Process the full suite
  runner.on('end', function () {
    try {
      /* istanbul ignore else */
      if (!endCalled) {
        // end gets called more than once for some reason
        // so we ensure the suite is processed only once
        endCalled = true;

        var allSuites = _this.runner.suite;

        traverseSuites(allSuites);

        var obj = {
          stats: _this.stats,
          suites: allSuites,
          allTests: allTests.map(cleanTest),
          allPending: allPending.map(cleanTest),
          allPasses: allPasses.map(cleanTest),
          allFailures: allFailures.map(cleanTest),
          copyrightYear: new Date().getFullYear()
        };

        obj.stats.testsRegistered = totalTestsRegistered;

        var _obj$stats = obj.stats,
            passes = _obj$stats.passes,
            failures = _obj$stats.failures,
            pending = _obj$stats.pending,
            tests = _obj$stats.tests,
            testsRegistered = _obj$stats.testsRegistered;

        var passPercentage = Math.round(passes / (testsRegistered - pending) * 1000) / 10;
        var pendingPercentage = Math.round(pending / testsRegistered * 1000) / 10;

        obj.stats.passPercent = passPercentage;
        obj.stats.pendingPercent = pendingPercentage;
        obj.stats.other = passes + failures + pending - tests;
        obj.stats.hasOther = obj.stats.other > 0;
        obj.stats.skipped = testsRegistered - tests;
        obj.stats.hasSkipped = obj.stats.skipped > 0;
        obj.stats.failures -= obj.stats.other;
        obj.stats.passPercentClass = _getPercentClass(passPercentage);
        obj.stats.pendingPercentClass = _getPercentClass(pendingPercentage);

        // Save the final output to be used in the done function
        _this.output = stringify(obj, null, 2);
      }
    } catch (e) {
      // required because thrown errors are not handled directly in the
      // event emitter pattern and mocha does not have an "on error"
      /* istanbul ignore next */
      console.error('Problem with mochawesome: ' + e.stack);
    }
  });
}

module.exports = Mochawesome;