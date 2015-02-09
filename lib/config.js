var path = require('path');

var config = {
  splitChar: process.platform === 'win32' ? '\\' : '/',
};

// Base Directories
config.libDir         = __dirname;
config.reportDir      = path.join(process.cwd(), 'mochawesome-reports');
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
config.reportJsonFile = path.join(config.reportDir, 'mochawesome-report.json');
config.reportHtmlFile = path.join(config.reportDir, 'mochawesome.html');

// Client-Side JS Files
config.clientJsFiles  = [path.join(config.srcJsDir, 'mochawesome.js')];

// Vendor JS Files
config.vendorJsFiles  = [path.join(config.nodeModulesDir, 'jquery', 'dist', 'jquery.js'),
                         path.join(config.bsDir, 'js', 'transition.js'),
                         path.join(config.bsDir, 'js', 'collapse.js'),
                         path.join(config.srcJsDir, 'lodash.custom.js'),
                         path.join(config.nodeModulesDir, 'chart.js', 'Chart.js')];

module.exports = config;