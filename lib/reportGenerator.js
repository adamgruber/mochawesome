var async = require('async'),
    fs = require('fs'),
    ncp = require('ncp'),
    util = require('util'),
    config = require('./config');

exports.generateReport = generateReport;
exports.saveToFile = saveToFile;

function generateReport() {
  util.print('Generating Report Files...\n');
  async.auto({
      createDirs: function(callback) {
        // console.log('createDirs');
        // async code to create directories to store files
        createDirs(callback);
      },
      copyStyles: ['createDirs', function(callback) {
        // after creating directories,
        // copy styles to css dir
        copyStyles(callback);
      }],
      copyScripts: ['createDirs', function(callback) {
        // after creating directories,
        // copy scripts to js dir
        copyScripts(callback);
      }],
      copyFonts: ['createDirs', function(callback) {
        // after creating directories,
        // copy fonts to fonts dir
        copyFonts(callback);
      }]
  }, function(err, results) {
      if (err) throw err;
      // console.log('err = ', err);
      // console.log('results = ', results);
  });
}


function createDirs (callback) {
  var dirs = [config.reportDir, config.reportJsDir, config.reportFontsDir, config.reportCssDir];
  dirs.forEach(function(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
  callback(null, 'done');
}

function copyFonts (callback) {
  ncp(config.buildFontsDir, config.reportFontsDir, function (err) {
    if (err) callback(err);
    callback(null, 'done');
  });
}

function copyStyles (callback) {
  ncp(config.buildCssDir, config.reportCssDir, function (err) {
    if (err) callback(err);
    callback(null, 'done');
  });
}

function copyScripts (callback) {
  ncp(config.buildJsDir, config.reportJsDir, function (err) {
    if (err) callback(err);
    callback(null, 'done');
  });
}

function saveToFile (data, outFile, callback) {
  var writeFile;
  try {
    writeFile = fs.openSync(outFile, 'w');
    fs.writeSync(writeFile, data);
    fs.close(writeFile);
    callback(null, outFile);
  } catch (err) {
    util.print('\nError: Unable to save ' + outFile + '\n' + err + '\n');
    callback(err);
  }
}