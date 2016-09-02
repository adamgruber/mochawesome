const mocha = require('mocha');
const _ = require('lodash');
const uuid = require('node-uuid');
// const chalk = require('chalk');
const Highlight = require('highlight.js');
const reportGen = require('./reportGenerator');
const stringify = require('json-stringify-safe');
const conf = require('./config');
const templates = require('./templates.js');
const opener = require('opener');
const debug = require('debug')('mochawesome');
// const error = debug('mochawesome:error');
// const log = debug('mochawesome:log');

// log.log = console.log.bind(console); // eslint-disable-line

const Base = mocha.reporters.Base;
const generateReport = reportGen.generateReport;
const saveToFile = reportGen.saveToFile;
let totalTestsRegistered;

Highlight.configure({
  useBR: true,
  languages: [ 'javascript' ]
});

/**
 * HELPER FUNCTIONS
 */

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
  let code = test.fn ? test.fn.toString() : test.body;
  const err = test.err ? _.pick(test.err, [ 'name', 'message', 'stack' ]) : test.err;

  if (code) {
    code = cleanCode(code);
    code = Highlight.fixMarkup(Highlight.highlightAuto(code).value);
  }

  if (err && err.stack) {
    err.stack = Highlight.fixMarkup(Highlight.highlightAuto(err.stack).value);
  }

  const cleaned = {
    title: test.title,
    fullTitle: test.fullTitle(),
    timedOut: test.timedOut,
    duration: test.duration || 0,
    state: test.state,
    speed: test.speed,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    pending: test.pending,
    code,
    err,
    isRoot: test.parent.root,
    uuid: uuid.v4(),
    parentUUID: test.parent.uuid
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
  const passingTests = _.where(cleanTests, { state: 'passed' });
  const failingTests = _.where(cleanTests, { state: 'failed' });
  const pendingTests = _.where(cleanTests, { pending: true });
  const skippedTests = _.where(cleanTests, { skipped: true });
  let duration = 0;

  _.each(cleanTests, test => {
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
 * Initialize a new reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Mochawesome(runner, options) {
  // Reset total tests counter
  totalTestsRegistered = 0;

  // Create/Save necessary report dirs/files
  const reporterOpts = options.reporterOptions || {};
  const config = conf(reporterOpts);

  generateReport(config);

  const self = this;
  Base.call(self, runner);

  // Show the Spec Reporter in the console
  const spec = new mocha.reporters.Spec(runner);
  spec();

  let allSuites = {};
  const allTests = [];
  const allPending = [];
  const allFailures = [];
  const allPasses = [];
  let endCalled = false;

  runner.on('test end', test => {
    allTests.push(test);
  });

  runner.on('pending', test => {
    allPending.push(test);
  });

  runner.on('pass', test => {
    allPasses.push(test);
  });

  runner.on('fail', test => {
    allFailures.push(test);
  });

  runner.on('end', () => {
    try {
      if (!endCalled) {
        endCalled = true; // end gets called more than once for some reason so this ensures we only do this once

        allSuites = self.runner.suite;

        traverseSuites(allSuites);

        const obj = {
          reportTitle: config.reportTitle || process.cwd().split(config.splitChar).pop(),
          inlineAssets: config.inlineAssets,
          stats: self.stats,
          suites: allSuites,
          allTests: allTests.map(cleanTest),
          allPending,
          allPasses: allPasses.map(cleanTest),
          allFailures: allFailures.map(cleanTest),
          copyrightYear: new Date().getFullYear()
        };

        obj.stats.testsRegistered = totalTestsRegistered;

        const passPercentage = Math.round((obj.stats.passes / (obj.stats.testsRegistered - obj.stats.pending))*1000)/10;
        const pendingPercentage = Math.round((obj.stats.pending / obj.stats.testsRegistered)*1000)/10;

        obj.stats.passPercent = passPercentage;
        obj.stats.pendingPercent = pendingPercentage;
        obj.stats.other = (obj.stats.passes + obj.stats.failures + obj.stats.pending) - obj.stats.tests;
        obj.stats.hasOther = obj.stats.other > 0;
        obj.stats.skipped = obj.stats.testsRegistered - obj.stats.tests;
        obj.stats.hasSkipped = obj.stats.skipped > 0;
        obj.stats.failures -= obj.stats.other;
        obj.stats.passPercentClass = _getPercentClass(passPercentage);
        obj.stats.pendingPercentClass = _getPercentClass(pendingPercentage);

        if (!templates.mochawesome) {
          debug('Mochawesome was unable to load the template.');
        }

        saveToFile(stringify(obj, null, 2), config.reportJsonFile, () => {});
        saveToFile(templates.mochawesome(obj), config.reportHtmlFile, () => {
          debug(`\nReport saved to ${config.reportHtmlFile}\n\n`);
          if (config.autoOpen) {
            opener(config.reportHtmlFile);
          }
        });
      }
    } catch (e) { // required because thrown errors are not handled directly in the event emitter pattern and mocha does not have an "on error"
      debug(`Problem with mochawesome: ${e.stack}`);
    }
  });
}

module.exports = Mochawesome;
