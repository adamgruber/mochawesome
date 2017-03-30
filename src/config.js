const marge = require('mochawesome-report-generator');

// Grab shared base config from mochawesome-report-generator
const baseConfig = Object.assign(marge.getBaseConfig(), {
  saveJson: true
});

const boolOpts = [
  'inlineAssets',
  'autoOpen',
  'enableCharts',
  'enableCode',
  'overwrite',
  'quiet',
  'dev'
];

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

  [
    'reportFilename',
    'reportDir',
    'reportTitle',
    'reportPageTitle',
    'inlineAssets',
    'autoOpen',
    'enableCharts',
    'enableCode',
    'timestamp',
    'overwrite',
    'quiet',
    'dev'
  ].forEach(optName => {
    options[optName] = _getOption(optName, opts, boolOpts.indexOf(optName) >= 0);
  });

  return Object.assign(baseConfig, options);
};
