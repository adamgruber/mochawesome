const path = require('path');

const splitChar = process.platform === 'win32' ? '\\' : '/';
const baseConfig = {
  reportDir: path.join('.', 'mochawesome-reports'),
  reportFilename: 'mochawesome',
  reportTitle: process.cwd().split(splitChar).pop(),
  reportPageTitle: 'Mochawesome Report Card'
};

function _getOption(optToGet, options, isBool) {
  const envVar = `MOCHAWESOME_${optToGet.toUpperCase()}`;
  // Order of precedence
  // 1. Config option
  // 2. Environment variable
  // 3. Base config
  if (options && typeof options[optToGet] !== 'undefined') {
    return (isBool && typeof options[optToGet] === 'string')
      ? options[optToGet] === 'true'
      : options[optToGet];
  }
  if (typeof process.env[envVar] !== 'undefined') {
    return isBool
      ? process.env[envVar] === 'true'
      : process.env[envVar];
  }
  return isBool
    ? baseConfig[optToGet] === 'true'
    : baseConfig[optToGet];
}

module.exports = function (opts) {
  const options = {};
  const reportFilename = _getOption('reportFilename', opts);

  options.reportDir = _getOption('reportDir', opts);
  options.reportTitle = _getOption('reportTitle', opts);
  options.reportPageTitle = _getOption('reportPageTitle', opts);
  options.inlineAssets = _getOption('inlineAssets', opts, true);
  options.autoOpen = _getOption('autoOpen', opts, true);
  // options.nodeModulesDir = path.join(__dirname, '..', 'node_modules');

  // Build Directories
  // config.buildDir = path.join(__dirname, '..', 'dist');
  // config.buildFontsDir = path.join(config.buildDir, 'fonts');
  // config.buildCssDir = path.join(config.buildDir, 'css');
  // config.buildJsDir = path.join(config.buildDir, 'js');

  // Source Directories
  // config.srcDir = path.join(__dirname, '..', 'src');
  // config.srcFontsDir = path.join(config.srcDir, 'fonts');
  // config.srcJsDir = path.join(config.srcDir, 'js');

  // Report Directories
  // config.reportJsDir = path.join(config.reportDir, 'js');
  // config.reportFontsDir = path.join(config.reportDir, 'fonts');
  // config.reportCssDir = path.join(config.reportDir, 'css');

  // Report Files
  options.reportJsonFile = path.join(options.reportDir, `${reportFilename}.json`);
  options.reportHtmlFile = path.join(options.reportDir, `${reportFilename}.html`);

  // Client-Side JS Files
  // config.clientJsFiles = [ path.join(config.srcJsDir, 'mochawesome.js') ];

  // Vendor JS Files
  // config.vendorJsFiles = [
  //   path.join(config.nodeModulesDir, 'chart.js', 'Chart.js')
  // ];

  return Object.assign(baseConfig, options);
};
