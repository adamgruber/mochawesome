const path = require('path');

const baseConfig = {
  reportDir: './mochawesome-reports',
  reportFilename: 'mochawesome',
  reportTitle: process.cwd().split(path.sep).pop(),
  reportPageTitle: 'Mochawesome Report Card',
  inlineAssets: false,
  autoOpen: false,
  enableCharts: true,
  enableCode: true,
  quiet: false,
  dev: false
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
  return baseConfig[optToGet];
}

module.exports = function (opts) {
  const options = {};

  // Added for compatibility. enableTestCode option is deprecated as of 2.0.3
  if (Object.hasOwnProperty.call(opts, 'enableTestCode')) {
    opts.enableCode = opts.enableTestCode;
    delete opts.enableTestCode;
  }

  options.reportFilename = _getOption('reportFilename', opts);
  options.reportDir = path.resolve(_getOption('reportDir', opts));
  options.reportTitle = _getOption('reportTitle', opts);
  options.reportPageTitle = _getOption('reportPageTitle', opts);
  options.inlineAssets = _getOption('inlineAssets', opts, true);
  options.autoOpen = _getOption('autoOpen', opts, true);
  options.enableCharts = _getOption('enableCharts', opts, true);
  options.enableCode = _getOption('enableCode', opts, true);
  options.quiet = _getOption('quiet', opts, true);
  options.dev = _getOption('dev', opts, true);

  // Report Files
  options.reportJsonFile = path.join(options.reportDir, `${options.reportFilename}.json`);
  options.reportHtmlFile = path.join(options.reportDir, `${options.reportFilename}.html`);

  return Object.assign(baseConfig, options);
};
