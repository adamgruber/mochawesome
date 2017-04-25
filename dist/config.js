'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var marge = require('mochawesome-report-generator');

// Grab shared base config from mochawesome-report-generator
var baseConfig = (0, _assign2.default)(marge.getBaseConfig(), {
  reportFilename: 'mochawesome',
  saveJson: true
});

var boolOpts = ['inlineAssets', 'autoOpen', 'enableCharts', 'enableCode', 'overwrite', 'quiet', 'dev'];

function _getOption(optToGet, options, isBool) {
  var envVar = 'MOCHAWESOME_' + optToGet.toUpperCase();
  // Order of precedence
  // 1. Config option
  // 2. Environment variable
  // 3. Base config
  if (options && typeof options[optToGet] !== 'undefined') {
    return isBool && typeof options[optToGet] === 'string' ? options[optToGet] === 'true' : options[optToGet];
  }
  if (typeof process.env[envVar] !== 'undefined') {
    return isBool ? process.env[envVar] === 'true' : process.env[envVar];
  }
  return baseConfig[optToGet];
}

module.exports = function (opts) {
  var options = {};

  // Added for compatibility. enableTestCode option is deprecated as of 2.0.3
  if (Object.hasOwnProperty.call(opts, 'enableTestCode')) {
    opts.enableCode = opts.enableTestCode;
    delete opts.enableTestCode;
  }

  ['reportFilename', 'reportDir', 'reportTitle', 'reportPageTitle', 'inlineAssets', 'autoOpen', 'enableCharts', 'enableCode', 'timestamp', 'overwrite', 'quiet', 'dev'].forEach(function (optName) {
    options[optName] = _getOption(optName, opts, boolOpts.indexOf(optName) >= 0);
  });

  return (0, _assign2.default)(baseConfig, options);
};