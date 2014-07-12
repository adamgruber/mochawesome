var util = require('util'),
    fs   = require('fs'),
    path = require('path'),
    mocha = require('mocha'),
    _ = require('lodash'),
    handlebars = require('handlebars'),
    moment = require('moment'),
    less = require('less');

var Base = mocha.reporters.Base,
    utils = mocha.utils,
    cursor = Base.cursor,
    color = Base.color;

var reportsDir = path.join(process.cwd(), 'reports'),
    reportJsonFile = path.join(reportsDir, 'reports.json'),
    reportHtmlFile = path.join(reportsDir, 'mochawesome.html');
    reportCssFile = path.join(reportsDir, 'mochawesome.css');

module.exports = Mochawesome;

createStylesheet();

// Load templates
// TODO: load all files in templates directory instead of specific ones
var mochawesomeReport = fs.readFileSync(path.join(__dirname, '..', 'templates', 'mochawesome.mu'), {
  encoding: 'utf8'
});

var _summary = fs.readFileSync(path.join(__dirname, '..', 'templates', '_summary.mu'), {
  encoding: 'utf8'
});

var _suite = fs.readFileSync(path.join(__dirname, '..', 'templates', '_suite.mu'), {
  encoding: 'utf8'
});

var _test = fs.readFileSync(path.join(__dirname, '..', 'templates', '_test.mu'), {
  encoding: 'utf8'
});

// TODO: if filename begins with underscore, register it as a partial
handlebars.registerPartial('_summary', _summary);
handlebars.registerPartial('_suite', _suite);
handlebars.registerPartial('_test', _test);

// Compile template
var mochawesomeReportTmp = handlebars.compile(mochawesomeReport);


/**
 * Initialize a new reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Mochawesome (runner) {
  var self = this;
  Base.call(this, runner);

  var allSuites = {},
      allTests = [],
      allFailures = [],
      allPasses = [];

  runner.on('suite', function (suite) {
    // ignore the root suite
    if (!suite.root) {
      // top level suite
      if (suite.parent.root) {
        allSuites[suite.title] = {};
      }

      // nested suite 1 level deep only
      if (!suite.parent.root && suite.parent.parent.root) {
        parentSuite = allSuites[suite.parent.title];
        if (!parentSuite.childSuites) {
          parentSuite.childSuites = {};
        }
        parentSuite.childSuites[suite.title] = {};
      }
    }
  });

  runner.on('suite end', function (suite) {
    // ignore the root suite
    if (!suite.root) {
      
      var allTests = suite.tests.map(cleanTest);
      var passingTests = allTests.filter(filterTest.bind(self, true));
      var failingTests = allTests.filter(filterTest.bind(self, false));

      // TODO: account for child suites in suite totals
      var suiteObj = {
        title: suite.title,
        fullTitle: suite.fullTitle(),
        file: suite.file.replace(process.cwd(), ''),
        fullFile: suite.file,
        tests: allTests,
        passes: passingTests,
        failures: failingTests,
        totalTests: suite.tests.length,
        totalPasses: passingTests.length,
        totalFailures: failingTests.length
      };

      // top level suite
      if (suite.parent.root) {
        allSuites[suite.title] = _.merge(allSuites[suite.title], suiteObj);
      }

      // nested suite 1 level deep only
      if (!suite.parent.root && suite.parent.parent.root) {
        parentSuite = allSuites[suite.parent.title];
        parentSuite.childSuites[suite.title] = suiteObj;
      }
    }
  });

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

    // unless we render client-side, this has to be updated client-side
    // self.stats.endDateStr = moment(self.stats.end).fromNow();

    var obj = {
      stats: self.stats,
      suites: allSuites,
      tests: allTests.map(cleanTest),
      passes: allPasses.map(cleanTest),
      failures: allFailures.map(cleanTest)
    };
    
    saveToFile('json', obj);
    saveToFile('html', obj);
  });
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
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    state: test.state,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    code: utils.clean(test.fn.toString()),
    err: test.err
  }
}

function filterTest (passes, test) {
  return test.state === (passes ? 'passed' : 'failed');
}

/**
 * Save data out to files
 *
 * @param {String} json, html
 * @param {Object}
 * @api private
 */

function createStylesheet () {
  var stylesheet = fs.readFileSync(path.join(__dirname, '..', 'templates', 'styles', 'mochawesome.less'), {
    encoding: 'utf8'
  });

  var stylesPath = path.join(__dirname, '..', 'templates', 'styles');
  var bsPath = path.join(__dirname, '..', 'node_modules', 'bootstrap', 'less');

  var parser = new(less.Parser)({
    paths: [stylesPath, bsPath], // Specify search paths for @import directives
  });

  parser.parse(stylesheet, function(e, tree) {
    if (e) console.log(e);
    var outCss = tree.toCSS({
      compress: true
    });
    saveToFile('css', outCss);
  });
}

function saveToFile (filetype, inData) {
  var outData, outFile, writeFile;
  var outMsg = '';
  switch (filetype) {
  case 'json':
    outData = JSON.stringify(inData, null, 2);
    outFile = reportJsonFile;
    break;
  case 'html':
    outData = mochawesomeReportTmp(inData);
    outFile = reportHtmlFile;
    outMsg = "\nopen " + outFile.replace(process.cwd(),'').replace('/', '') + "\n";
    break;
  case 'css':
    outData = inData;
    outFile = reportCssFile;
    break;
  }

  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    };
    writeFile = fs.openSync(outFile, 'w');
    fs.writeSync(writeFile, outData);
    fs.close(writeFile);
    util.print("Saved " + outFile + "\n" + outMsg);

  } catch (err) {
    console.log(err);
    util.print("\nError: Unable to save " + outFile + "\n");
  }

}