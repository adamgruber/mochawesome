var async  = require('async'),
    fs     = require('fs'),
    ncp    = require('ncp'),
    _      = require('lodash'),
    chalk  = require('chalk'),
    mkdirp = require('mkdirp');

exports.generateReport = generateReport;
exports.saveToFile = saveToFile;

function generateReport (config) {
  console.log('[' + chalk.gray('mochawesome') + '] Generating report files...\n');
  if (config.inlineAssets) {
    return createDirs(config, true, _.noop);
  }
  async.auto({
      createDirs: function(callback) {
        // console.log('createDirs');
        // async code to create directories to store files
        createDirs(config, null, callback);
      },
      copyStyles: ['createDirs', function(callback) {
        // after creating directories,
        // copy styles to css dir
        copyStyles(config, callback);
      }],
      copyScripts: ['createDirs', function(callback) {
        // after creating directories,
        // copy scripts to js dir
        copyScripts(config, callback);
      }],
      copyFonts: ['createDirs', function(callback) {
        // after creating directories,
        // copy fonts to fonts dir
        copyFonts(config, callback);
      }]
  }, function(err, results) {
      if (err) throw err;
      // console.log('err = ', err);
      // console.log('results = ', results);
  });
}


function createDirs (config, inline, callback) {
  var dirs = [config.reportDir];
  if (!inline) {
    dirs = dirs.concat([config.reportJsDir, config.reportFontsDir, config.reportCssDir]);
  }
  dirs.forEach(function(dir) {
    mkdirp.sync(dir);
  });
  callback(null, 'done');
}

function copyFonts (config, callback) {
  ncp(config.buildFontsDir, config.reportFontsDir, function (err) {
    if (err) callback(err);
    callback(null, 'done');
  });
}

function copyStyles (config, callback) {
  ncp(config.buildCssDir, config.reportCssDir, function (err) {
    if (err) callback(err);
    callback(null, 'done');
  });
}

function copyScripts (config, callback) {
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
    console.log('\n[' + chalk.gray('mochawesome') + '] Error: Unable to save ' + outFile + '\n' + err + '\n');
    callback(err);
  }
}