var path = require('path');

var config = {
  splitChar: process.platform === "win32" ? '\\' : '/',
};

config.reportDir =      path.join(process.cwd(), 'mochawesome-reports');
config.templatesDir =   path.join(__dirname, '..', 'templates');
config.nodeModulesDir = path.join(__dirname, '..', 'node_modules');

config.stylesDir =      path.join(config.templatesDir, 'styles');
config.bsFontsDir =     path.join(config.nodeModulesDir, 'bootstrap', 'fonts');
config.bsLessDir =      path.join(config.nodeModulesDir, 'bootstrap', 'less');

config.reportJsDir =    path.join(config.reportDir, 'js');
config.reportFontsDir = path.join(config.reportDir, 'fonts');
config.reportCssDir =   path.join(config.reportDir, 'css');

config.reportLessFile = path.join(config.stylesDir, 'mochawesome.less');
config.reportJsonFile = path.join(config.reportDir, 'mochawesome-report.json');
config.reportHtmlFile = path.join(config.reportDir, 'mochawesome.html');
config.reportJsFile =   path.join(config.reportJsDir, 'mochawesome.js');
config.reportCssFile =  path.join(config.reportCssDir, 'mochawesome.css');

module.exports = config;