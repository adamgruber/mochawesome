const path = require('path');

const baseConfig = {
  reportDir: path.join('.', 'mochawesome-reports'),
  reportFilename: 'mochawesome',
  reportTitle: process.cwd().split(path.sep).pop(),
  reportPageTitle: 'Mochawesome Report Card',
  inlineAssets: false,
  autoOpen: false,
  enableCharts: true,
  enableTestCode: true,
  quiet: false
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
  options.enableCharts = _getOption('enableCharts', opts, true);
  options.enableTestCode = _getOption('enableTestCode', opts, true);
  options.quiet = _getOption('quiet', opts, true);

  // Report Files
  options.reportJsonFile = path.join(options.reportDir, `${reportFilename}.json`);
  options.reportHtmlFile = path.join(options.reportDir, `${reportFilename}.html`);

  return Object.assign(baseConfig, options);
};
