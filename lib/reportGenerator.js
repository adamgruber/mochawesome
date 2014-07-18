var async = require('async');
var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');
var moment = require('moment');
var less = require('less');
var util = require('util');
var uglify = require('uglify-js');
var templates = {};

var config = require('./config');

module.exports = generateReport;

function generateReport(testJsonOutput) {
  var testJsonOutput = testJsonOutput || {};
  async.auto({
      loadTemplates: function(callback) {
        console.log('loadTemplates');
        // async code to load and register hbs templates
        loadTemplates(callback);
      },
      createDirs: function(callback) {
        console.log('createDirs');
        // async code to create directories to store files
        createDirs(callback);
      },
      parseLess: function(callback) {
        console.log('parseLess');
        // parse less
        parseLess(callback);
      },
      minifyJs: function(callback) {
        console.log('minifyJs');
        // concat and minify js
        minifyJs(callback);
      },
      registerHbsHelpers: function(callback) {
        console.log('registerHbsHelpers');
        // register helpers
        registerHbsHelpers(callback);
      },
      saveCss: ['createDirs', 'parseLess', function(callback,  results) {
        console.log('saveCss');
        // after creating directories and parsing less,
        // save the css to file
        saveToFile(results.parseLess, config.reportCssFile, null, callback);
      }],
      saveJs: ['createDirs', 'minifyJs', function(callback, results) {
        console.log('saveJs');
        // after creating directories and minifying js,
        // save the js to file
        saveToFile(results.minifyJs.code, config.reportJsFile, null, callback);
      }],
      saveFonts: ['createDirs', function(callback) {
        console.log('saveFonts');
        // after creating directories,
        // copy fonts to fonts dir
        saveFonts(callback);
      }],
      saveJson: ['createDirs', function (callback) {
        console.log('saveJson');
        // after creating directories,
        // save json to file
        var outJson = JSON.stringify(testJsonOutput, null, 2);
        saveToFile(outJson, config.reportJsonFile, null, callback);
      }],
      saveHtml: ['createDirs', 'loadTemplates', 'registerHbsHelpers', function(callback, results) {
        console.log('saveHtml');
        // after creating directories, loading templates, and registering helpers,
        // render the html and save to file
        var htmlOut = results.loadTemplates.mochawesome(testJsonOutput);
        var outMsg = "\nopen " + config.reportHtmlFile.replace(process.cwd(),'').replace('/', '') + "\n\n";
        saveToFile(htmlOut, config.reportHtmlFile, outMsg, callback);
      }]
  }, function(err, results) {
      console.log('err = ', err);
      // console.log('results = ', results);
  });
}

function loadTemplates(callback) {
  async.waterfall([
    function (cb) {
      fs.readdir(config.templatesDir, function (err, files) {
        if (err) cb(err);
        cb(null, files);
      });
    },
    function (files, cb) {
      async.filter(files, filterTemplateFile, function (templateFiles) {
        cb(null, templateFiles);
      });
    },
    function (templateFiles, cb) {
      async.each(templateFiles, registerTemplate, function (err) {
        if (err) cb(err);
        cb();
      });
    }
  ], function (err, result) {
    // result
    if (err) callback(err);
    callback(null, templates);
  });
}

function saveFonts(callback) {
  async.waterfall([
    function (cb) {
      fs.readdir(config.bsFontsDir, function (err, files) {
        if (err) cb(err);
        cb(null, files);
      });
    },
    function (fontFiles, cb) {
      async.each(fontFiles, copyFontFile, function (err) {
        if (err) cb(err);
        cb();
      });
    }
  ], function (err, result) {
    // result
    if (err) callback(err);
    callback(null, 'done');
  });
}

function copyFontFile(fontFile, cb) {
  var inFile = path.join(config.bsFontsDir, fontFile);
  var outFile = path.join(config.reportFontsDir, fontFile);

  fs.readFile(inFile, {encoding:'utf8'}, function (err, data) {
    if (err) cb(err);
    saveToFile(data, outFile, '', cb)
  });
}

function filterTemplateFile(file, cb) {
  cb(file.substr(-3) === '.mu');
}

function registerTemplate(templateFile, cb) {
  var filePath = path.join(config.templatesDir, templateFile);
  var templateName = templateFile.replace('.mu', '');
  fs.readFile(filePath, {encoding: 'utf8'}, function (err, data) {
    if (err) cb(err);
    if (templateName.indexOf('_') === 0) {
      handlebars.registerPartial(templateName, data);
    } else {
      templates[templateName] = handlebars.compile(data);
    }
    cb(null);
  });
}
  
function createDirs (callback) {
  var dirs = [config.reportDir, config.reportJsDir, config.reportFontsDir, config.reportCssDir];
  dirs.forEach(function(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    };
  });
  callback(null, 'done');
}

function parseLess (callback) {
  var stylesheet = fs.readFileSync(config.reportLessFile, {encoding: 'utf8'});
  var parser = new(less.Parser)({
    paths: [config.stylesDir, config.bsLessDir],
  });
  parser.parse(stylesheet, function(err, tree) {
    if (err) callback(err);
    var outCss = tree.toCSS({
      compress: true
    });
    callback(null, outCss);
  });
}

function minifyJs (callback) {
  var jsReqs = [
    path.join(config.nodeModulesDir, 'chart.js', 'Chart.js'),
    path.join(config.nodeModulesDir, 'bootstrap', 'dist', 'js', 'bootstrap.js')
  ];
  callback(null, uglify.minify(jsReqs));
}

function registerHbsHelpers (callback) {
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

  handlebars.registerHelper('formatSummarySuiteCount', function (context) {
    return context === 1 ? 'Suite' : 'Suites';
  });

  handlebars.registerHelper('formatSummaryTestCount', function (context) {
    return context === 1 ? 'Test' : 'Tests';
  });

  handlebars.registerHelper('formatSummaryDuration', function (context) {
    var dur = getDurationObj(context);
    if (dur.hrs  < 1) {
      if (dur.min < 1) {
        if (dur.sec < 1) {
          return context;
        }
        return dur.sec;
      }
      return Math.round(dur.min*100)/100;
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

  callback(null, 'done');
}

function saveToFile (data, outFile, outMsg, callback) {
  var writeFile;
  var outMsg = outMsg || '';
  try {
    writeFile = fs.openSync(outFile, 'w');
    fs.writeSync(writeFile, data);
    fs.close(writeFile);
    util.print("Saved " + outFile + "\n" + outMsg);
    callback(null, outFile);
  } catch (err) {
    util.print("\nError: Unable to save " + outFile + "\n" + err + "\n");
    callback(err);
  }
}