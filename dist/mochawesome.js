'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Done function gets called before mocha exits
 *
 * @param {Object} output
 * @param {Object} config
 * @param {Function} exit
 */

var done = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(output, config, failures, exit) {
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

            exit(failures);
            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](1);

            log(_context.t0, 'error', config);
            exit(failures);

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 11]]);
  }));

  return function done(_x, _x2, _x3, _x4) {
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

var mocha = require('mocha');
var uuid = require('uuid');
var stringify = require('json-stringify-safe');
var conf = require('./config');
var marge = require('mochawesome-report-generator');
var utils = require('./utils');

// Import the utility functions
var log = utils.log,
    getPercentClass = utils.getPercentClass,
    cleanTest = utils.cleanTest,
    traverseSuites = utils.traverseSuites,
    saveFile = utils.saveFile;

// Track the total number of tests registered

var totalTestsRegistered = { total: 0 };function Mochawesome(runner, options) {
  var _this = this;

  // Done function will be called before mocha exits
  // This is where we will save JSON and generate the report
  this.done = function (failures, exit) {
    return done(_this.output, _this.config, failures, exit);
  };

  // Reset total tests counter
  totalTestsRegistered.total = 0;

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

        traverseSuites(allSuites, totalTestsRegistered);

        var obj = {
          stats: _this.stats,
          suites: allSuites,
          allTests: allTests.map(cleanTest),
          allPending: allPending.map(cleanTest),
          allPasses: allPasses.map(cleanTest),
          allFailures: allFailures.map(cleanTest),
          copyrightYear: new Date().getFullYear()
        };

        obj.stats.testsRegistered = totalTestsRegistered.total;

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
        obj.stats.passPercentClass = getPercentClass(passPercentage);
        obj.stats.pendingPercentClass = getPercentClass(pendingPercentage);

        // Save the final output to be used in the done function
        _this.output = stringify(obj, null, 2);
      }
    } catch (e) {
      // required because thrown errors are not handled directly in the
      // event emitter pattern and mocha does not have an "on error"
      /* istanbul ignore next */
      log('Problem with mochawesome: ' + e.stack, 'error');
    }
  });
}

module.exports = Mochawesome;