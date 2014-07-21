var util = require('util'),
    mocha = require('mocha'),
    _ = require('lodash'),
    uuid = require('node-uuid'),
    Highlight = require('highlight.js'),
    reportGen = require('./reportGenerator'),
    config = require('./config');

var Base = mocha.reporters.Base,
    utils = mocha.utils,
    generateReport = reportGen.generateReport,
    saveToFile = reportGen.saveToFile,
    templates = reportGen.templates;

module.exports = Mochawesome;

/**
 * Begin generating report
 * Creates/Saves necessary report files
 */

generateReport();

/**
 * Initialize a new reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Mochawesome (runner) {
  var self = this;
  Base.call(self, runner);

  // Show the Spec Reporter in the console
  new mocha.reporters.Spec(runner);

  var allSuites = {},
      allTests = [],
      allFailures = [],
      allPasses = [],
      endCalled = false;

  runner.on('test end', function (test) {
    allTests.push(test);
  });

  runner.on('pass', function (test) {
    allPasses.push(test);
  });

  runner.on('fail', function (test){
    allFailures.push(test);
  });

  runner.on('end', function () {
    if (!endCalled) {
      endCalled = true; // end gets called more than once for some reason so this ensures we only do this once

      allSuites = self.runner.suite;
      traverseSuites(allSuites);

      var obj = {
        reportTitle: process.cwd().split(config.splitChar).pop(),
        stats: self.stats,
        suites: allSuites,
        allTests: allTests.map(cleanTest),
        allPasses: allPasses.map(cleanTest),
        allFailures: allFailures.map(cleanTest)
      };

      var passPercentage = Math.round((obj.stats.passes / obj.stats.tests)*1000)/10;
      var percentClass;
      if (passPercentage <= 50) {
        percentClass = 'danger';
      } else if (passPercentage > 50 && passPercentage < 80) {
        percentClass = 'warning';
      } else {
        percentClass = 'success';
      }
      obj.stats.passPercent = passPercentage;
      obj.stats.percentClass = percentClass;

      saveToFile(JSON.stringify(obj, null, 2), config.reportJsonFile, null, function(){});
      saveToFile(templates.mochawesome(obj), config.reportHtmlFile, null, function() {
        util.print("\nopen " + config.reportHtmlFile.replace(process.cwd(),'').replace('/', '') + "\n\n");
      });
    }
  });
}


/**
 * HELPER FUNCTIONS
 */

/**
 * Do a breadth-first search to find
 * and format all nested 'suite' objects.
 *
 * @param {Object} suite
 * @api private
 */

function traverseSuites (suite) {
  var queue = [],
      next = suite;
  while (next) {
    if (next.root) {
      cleanSuite(next);
    }
    if (next.suites.length) {
      _.each(next.suites, function(suite, i) {
        cleanSuite(suite);
        queue.push(suite);
      });
    }
    next = queue.shift();
  }
}

/**
 * Modify the suite object to add properties needed to render
 * the template and remove properties we do not need.
 *
 * @param {Object} suite
 * @api private
 */

function cleanSuite (suite) {
  suite.uuid = uuid.v4();

  var cleanTests = _.map(suite.tests, cleanTest);
  var passingTests = _.where(cleanTests, {state: 'passed'});
  var failingTests = _.where(cleanTests, {state: 'failed'});
  var duration = 0;

  _.each(cleanTests, function (test) {
    duration += test.duration
  });

  suite.tests = cleanTests;
  suite.fullFile = suite.file || '';
  suite.file = suite.file ? suite.file.replace(process.cwd(), '') : '';
  suite.passes = passingTests;
  suite.failures = failingTests;
  suite.isEmpty = suite.tests.length === 0;
  suite.totalTests = suite.tests.length;
  suite.totalPasses = passingTests.length;
  suite.totalFailures = failingTests.length;
  suite.duration = duration;

  if (suite.root) {
    suite.rootEmpty = suite.totalTests === 0;
  }

  removeAllPropsFromObjExcept(suite, [
    'title',
    'tests',
    'suites',
    'file',
    'fullFile',
    'passes',
    'failures',
    'totalTests',
    'totalPasses',
    'totalFailures',
    'root',
    'uuid',
    'duration',
    'rootEmpty',
    'isEmpty',
    '_timeout'
  ]);
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function cleanTest (test) {
  var code = utils.clean(test.fn.toString());
  code = Highlight.highlightAuto(code, ['javascript']).value;
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    timedOut: test.timedOut,
    duration: test.duration || 0,
    state: test.state,
    speed: test.speed,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    code: code,
    err: test.err,
    isRoot: test.parent.root,
    uuid: uuid.v4(),
    parentUUID: test.parent.uuid
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
  _.forOwn(obj, function(val, prop) {
    if (propsToKeep.indexOf(prop) === -1) {
      delete obj[prop];
    }
  });
}