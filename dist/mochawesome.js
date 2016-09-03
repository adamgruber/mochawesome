'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var fs = require('fs');
var mocha = require('mocha');
var _ = require('lodash');
var uuid = require('node-uuid');
var chalk = require('chalk');
var hljs = require('highlight.js');
var stringify = require('json-stringify-safe');
var conf = require('./config');
var mkdirp = require('mkdirp');

// Configure options for highlight.js
hljs.configure({
  useBR: true,
  languages: ['javascript']
});

// Track the total number of tests registered
var totalTestsRegistered = void 0;

/**
 * HELPER FUNCTIONS
 */

function log(msg, level) {
  var logMethod = console[level] || console.log;
  var out = msg;
  if ((typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object') {
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
 * Strip the function definition from `str`,
 * and re-indent for pre whitespace.
 */

function cleanCode(str) {
  str = str.replace(/\r\n?|[\n\u2028\u2029]/g, '\n').replace(/^\uFEFF/, '').replace(/^function *\(.*\) *{|\(.*\) *=> *{?/, '').replace(/\s+\}$/, '');

  var spaces = str.match(/^\n?( *)/)[1].length;
  var tabs = str.match(/^\n?(\t*)/)[1].length;
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
  var code = test.fn ? test.fn.toString() : test.body;
  var err = test.err ? _.pick(test.err, ['name', 'message', 'stack']) : test.err;

  if (code) {
    code = cleanCode(code);
    code = hljs.fixMarkup(hljs.highlightAuto(code).value);
  }

  if (err && err.stack) {
    err.stack = hljs.fixMarkup(hljs.highlightAuto(err.stack).value);
  }

  var cleaned = {
    title: test.title,
    fullTitle: test.fullTitle(),
    timedOut: test.timedOut,
    duration: test.duration || 0,
    state: test.state,
    speed: test.speed,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    pending: test.pending,
    code: code,
    err: err,
    isRoot: test.parent.root,
    uuid: test.uuid,
    parentUUID: test.parent.uuid
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

  totalTestsRegistered += suite.tests ? suite.tests.length : 0;

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
 * Initialize a new reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Mochawesome(runner, options) {
  var _this = this;

  // Done function will be called before mocha exits
  // This is where we will save JSON and generate the report
  this.done = function (failures, exit) {
    log(options);
    mkdirp(_this.config.reportDir, function (err) {
      if (err) {
        log(err, 'error');
        exit();
      } else {
        fs.writeFile(_this.config.reportJsonFile, _this.output, function (writeErr) {
          if (writeErr) {
            log(writeErr, 'error');
            exit();
          } else {
            log('Report JSON saved to ' + _this.config.reportJsonFile);
            exit();
          }
        });
      }
    });
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
    return allPending.push(test);
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
          reportTitle: _this.config.reportTitle || process.cwd().split(_this.config.splitChar).pop(),
          inlineAssets: _this.config.inlineAssets,
          stats: _this.stats,
          suites: allSuites,
          allTests: allTests.map(cleanTest),
          allPending: allPending,
          allPasses: allPasses.map(cleanTest),
          allFailures: allFailures.map(cleanTest),
          copyrightYear: new Date().getFullYear()
        };

        obj.stats.testsRegistered = totalTestsRegistered;

        var passPercentage = Math.round(obj.stats.passes / (obj.stats.testsRegistered - obj.stats.pending) * 1000) / 10;
        var pendingPercentage = Math.round(obj.stats.pending / obj.stats.testsRegistered * 1000) / 10;

        obj.stats.passPercent = passPercentage;
        obj.stats.pendingPercent = pendingPercentage;
        obj.stats.other = obj.stats.passes + obj.stats.failures + obj.stats.pending - obj.stats.tests;
        obj.stats.hasOther = obj.stats.other > 0;
        obj.stats.skipped = obj.stats.testsRegistered - obj.stats.tests;
        obj.stats.hasSkipped = obj.stats.skipped > 0;
        obj.stats.failures -= obj.stats.other;
        obj.stats.passPercentClass = _getPercentClass(passPercentage);
        obj.stats.pendingPercentClass = _getPercentClass(pendingPercentage);

        // Save the final output to be used in the done function
        _this.output = stringify(obj, null, 2);
      }
    } catch (e) {
      // required because thrown errors are not handled directly in the event emitter pattern and mocha does not have an "on error"
      console.error('Problem with mochawesome: ' + e.stack);
    }
  });
}

module.exports = Mochawesome;