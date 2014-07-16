var util = require('util'),
    fs   = require('fs'),
    path = require('path'),
    mocha = require('mocha'),
    _ = require('lodash'),
    handlebars = require('handlebars'),
    less = require('less'),
    moment = require('moment'),
    uuid = require('node-uuid'),
    UglifyJS = require("uglify-js");

var Base = mocha.reporters.Base,
    utils = mocha.utils;

var splitChar = process.platform === "win32" ? '\\' : '/',
    reportsDir = path.join(process.cwd(), 'reports'),
    reportsJsDir = path.join(reportsDir, 'js'),
    reportJsonFile = path.join(reportsDir, 'mochawesome-report.json'),
    reportHtmlFile = path.join(reportsDir, 'mochawesome.html'),
    reportJsFile = path.join(reportsJsDir, 'mochawesome.js'),
    reportCssFile = path.join(reportsDir, 'mochawesome.css'),
    templatesDir = path.join(__dirname, '..', 'templates'),
    templates = {};

module.exports = Mochawesome;

createStylesheet();
saveJsReqs();
loadTemplates();
initHandlebarsHelpers();

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
        reportTitle: process.cwd().split(splitChar).pop(),
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

      saveToFile('json', obj);
      saveToFile('html', obj);
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
  suite.totalTests = suite.tests.length;
  suite.totalPasses = passingTests.length;
  suite.totalFailures = failingTests.length;
  suite.duration = duration;

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
    'duration'
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
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    state: test.state,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    code: utils.clean(test.fn.toString()),
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

/**
 * Compile LESS stylesheet into CSS and save to file.
 *
 * @api private
 */

function createStylesheet () {
  var stylesDir = path.join(templatesDir, 'styles');
  var bsPath = path.join(__dirname, '..', 'node_modules', 'bootstrap', 'less');
  var stylesheet = fs.readFileSync(path.join(stylesDir, 'mochawesome.less'), {encoding: 'utf8'});

  var parser = new(less.Parser)({
    paths: [stylesDir, bsPath], // Specify search paths for @import directives
  });

  parser.parse(stylesheet, function(e, tree) {
    if (e) throw e;
    var outCss = tree.toCSS({
      compress: true
    });
    saveToFile('css', outCss);
  });
}

/**
 * Get all required JS files, concat and minify then save to file.
 *
 * @api private
 */


function saveJsReqs () {
  var jsReqs = [
    path.join(__dirname, '..', 'node_modules', 'chart.js', 'Chart.js'),
    path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.js')
  ];
  var outJs = UglifyJS.minify(jsReqs);
  saveToFile('js', outJs.code);
}

function saveJsReqs2 () {
  var jsReqs = [
    path.join(__dirname, '..', 'node_modules', 'chart.js', 'Chart.js'),
    path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.js')
  ];
  var inJs = '';

  _.each(jsReqs, function (file, i, files) {
    fs.readFile(file, {encoding: 'utf-8'}, function (err, data) {
      if (err) throw err;
      inJs += data;
      if (i === files.length - 1) {
        console.log(uglifyjs);
        // var outJs = uglify.parser.parse(inJs);
        // outJs = uglify.uglify.ast_squeeze(outJs);
        // outJs = uglify.uglify.gen_code(outJs);
        // saveToFile('js', outJs);
      }
    });
  });
}

/**
 * Load and compile template files from templates directory.
 * Register any partials found in the directory.
 *
 * @api private
 */

function loadTemplates() {
  fs.readdir(templatesDir, function (err, files) {
    if (err) throw err;
    files.forEach(function (file) {
      var filePath = path.join(templatesDir, file);
      fs.stat(filePath, function (err, stats) {
        if (err) throw err;
        if (!stats.isDirectory()) {
          var fileName = file.replace('.mu','');
          fs.readFile(filePath, {encoding:'utf8'}, function (err, data) {
            if (err) throw err;
            if (file.indexOf('_') === 0) {
              handlebars.registerPartial(fileName, data);
            } else {
              templates[fileName] = handlebars.compile(data);
            }
          });
        }
      });
    });
  });
}

function loadTemplatesSync() {
  var files = fs.readdirSync(templatesDir);
  files.forEach(function (file) {
    var filePath = path.join(templatesDir, file);
    var fileStats = fs.statSync(filePath);
    var fileName = file.replace('.mu','');
    if (!fileStats.isDirectory()) {
      var file = fs.readFileSync(filePath, {encoding:'utf8'});
      if (file.indexOf('_') === 0) {
        handlebars.registerPartial(fileName, file);
      } else {
        templates[fileName] = handlebars.compile(file);
      }
    }
  });
}

/**
 * Save data out to files
 *
 * @param {String} json, html
 * @param {Object}
 * @api private
 */

function saveToFile (filetype, inData) {
  var outData, outFile, writeFile;
  var outMsg = '';
  switch (filetype) {
  case 'json':
    outData = JSON.stringify(inData, null, 2);
    outFile = reportJsonFile;
    break;
  case 'html':
    outData = templates.mochawesome(inData);
    outFile = reportHtmlFile;
    outMsg = "\nopen " + outFile.replace(process.cwd(),'').replace('/', '') + "\n";
    break;
  case 'css':
    outData = inData;
    outFile = reportCssFile;
    break;
  case 'js':
    outData = inData;
    outFile = reportJsFile;
    break;
  }

  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    };
    if (!fs.existsSync(reportsJsDir)) {
      fs.mkdirSync(reportsJsDir);
    };
    writeFile = fs.openSync(outFile, 'w');
    fs.writeSync(writeFile, outData);
    fs.close(writeFile);
    util.print("Saved " + outFile + "\n" + outMsg);

  } catch (err) {
    util.print("\nError: Unable to save " + outFile + "\n" + err + "\n");
  }
}

/**
 * Register Handlebars helpers used in template
 *
 * @api private
 */

function initHandlebarsHelpers () {
  function getDurationObj(durationInMilliseconds) {
    var dur = moment.duration(durationInMilliseconds, 'ms');
    return {
      duration: dur,
      hrs: dur.asHours(),
      min: dur.asMinutes(),
      sec: dur.asSeconds(),
      ms: durationInMilliseconds
    }
  }

  handlebars.registerHelper('formatSummaryDuration', function (context) {
    var dur = getDurationObj(context);
    if (dur.hrs  < 1) {
      if (dur.min < 1) {
        if (dur.sec < 1) {
          return context;
        }
        return dur.sec;
      }
      return dur.min;
    }
    return dur.duration.get('h') + ':' + dur.duration.get('m');
  });

  handlebars.registerHelper('getSummaryDurationUnits', function (context) {
    var dur = getDurationObj(context);
    if (dur.hrs  < 1) {
      if (dur.min < 1) {
        if (dur.sec < 1) {
          return 'Milliseconds';
        }
        return 'Seconds';
      }
      return 'Minutes';
    }
    return 'Hours';
  });

  handlebars.registerHelper('formatDuration', function (context) {
    var dur = getDurationObj(context);
    if (dur.hrs  < 1) {
      if (dur.min < 1) {
        if (dur.sec < 1) {
          return context + ' ms';
        }
        return dur.sec + ' s';
      }
      return dur.duration.get('m') + ':' + dur.duration.get('s') + '.' + dur.duration.get('ms') + ' m';
    }
    return dur.duration.get('h') + ':' + dur.duration.get('m') + ':' + dur.duration.get('s') + '.' + dur.duration.get('ms') + ' h';
  });

  handlebars.registerHelper('dateFormat', function(context, format) {
    if (format === "fromNow") {
      return moment(context).fromNow();
    } else {
      return moment(context).format(format);
    }
  });
}