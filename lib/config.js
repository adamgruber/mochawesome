var path = require('path');

var config = {
      splitChar: process.platform === 'win32' ? '\\' : '/',
      reportDir: path.join('.', 'mochawesome-reports'),
      reportName: 'mochawesome'
    };

module.exports = function (options) {
  // Base Directories
  config.libDir         = __dirname;
  config.reportDir      = _getOption('reportDir', options);
  config.reportTitle    = _getOption('reportTitle', options);
  config.inlineAssets   = _getOption('inlineAssets', options, true);
  config.autoOpen       = _getOption('autoOpen', options, true);
  config.nodeModulesDir = path.join(__dirname, '..', 'node_modules');

  // Build Directories
  config.buildDir       = path.join(__dirname, '..', 'dist');
  config.buildFontsDir  = path.join(config.buildDir, 'fonts');
  config.buildCssDir    = path.join(config.buildDir, 'css');
  config.buildJsDir     = path.join(config.buildDir, 'js');

  // Source Directories
  config.srcDir         = path.join(__dirname, '..', 'src');
  config.srcFontsDir    = path.join(config.srcDir, 'fonts');
  config.srcLessDir     = path.join(config.srcDir, 'less');
  config.srcJsDir       = path.join(config.srcDir, 'js');
  config.srcHbsDir      = path.join(config.srcDir, 'templates');

  // Bootstrap Directories
  config.bsDir          = path.join(config.nodeModulesDir, 'bootstrap');
  config.bsFontsDir     = path.join(config.bsDir, 'fonts');
  config.bsLessDir      = path.join(config.bsDir, 'less');

  // Report Directories
  config.reportJsDir    = path.join(config.reportDir, 'js');
  config.reportFontsDir = path.join(config.reportDir, 'fonts');
  config.reportCssDir   = path.join(config.reportDir, 'css');

  // Report Files
  config.reportJsonFile = path.join(config.reportDir, _getOption('reportName', options) + '.json');
  config.reportHtmlFile = path.join(config.reportDir, _getOption('reportName', options) + '.html');

  // Client-Side JS Files
  config.clientJsFiles  = [path.join(config.srcJsDir, 'mochawesome.js')];

  // Vendor JS Files
  config.vendorJsFiles  = [path.join(config.nodeModulesDir, 'jquery', 'dist', 'jquery.js'),
                           path.join(config.bsDir, 'js', 'transition.js'),
                           path.join(config.bsDir, 'js', 'collapse.js'),
                           path.join(config.srcJsDir, 'lodash.custom.js'),
                           path.join(config.nodeModulesDir, 'chart.js', 'Chart.js')];

  return config;
};

function _getOption (optToGet, options, isBool) {
  var envVar = 'MOCHAWESOME_' + optToGet.toUpperCase();
  // Order of precedence
  // 1. Config option
  // 2. Environment variable
  // 3. Base config
  if (options && typeof options[optToGet] !== 'undefined') {
    return (isBool && typeof options[optToGet] === 'string') ?
      options[optToGet] === 'true'
      : options[optToGet];
  }
  if (typeof process.env[envVar] !== 'undefined') {
    return (isBool && typeof options[optToGet] === 'string') ?
      process.env[envVar] === 'true'
      : process.env[envVar];
  }
  return (isBool && typeof config[optToGet] === 'string') ?
    config[optToGet] === 'true'
    : config[optToGet];
}