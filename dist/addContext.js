'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isObject = require('lodash/isObject');
var isEmpty = require('lodash/isEmpty');
var chalk = require('chalk');
var stringify = require('json-stringify-safe');

var errorPrefix = 'Error adding context:';
var ERRORS = {
  INVALID_ARGS: errorPrefix + ' Invalid arguments.',
  INVALID_TEST: errorPrefix + ' Invalid test object.',
  INVALID_CONTEXT: function INVALID_CONTEXT(ctx) {
    var expected = 'Expected a string or an object of shape { title: string, value: any } but saw:';
    return errorPrefix + ' ' + expected + '\n' + stringify(ctx, function (key, val) {
      return val === undefined ? 'undefined' : val;
    }, 2);
  }
};

/**
 * HELPER FUNCTIONS
 */

/* istanbul ignore next */
function log(msg, level) {
  var logMethod = console[level] || console.log;
  var out = msg;
  if ((typeof msg === 'undefined' ? 'undefined' : (0, _typeof3.default)(msg)) === 'object') {
    out = stringify(msg, null, 2);
  }
  logMethod('[' + chalk.gray('mochawesome') + '] ' + out + '\n');
}

function _isValidContext(ctx) {
  /*
   * Context is valid if any of the following are true:
   * 1. Type is string and it is not empty
   * 2. Type is object and it has properties `title` and `value` and `title` is not empty
   */
  if (!ctx) return false;
  return typeof ctx === 'string' && !isEmpty(ctx) || Object.hasOwnProperty.call(ctx, 'title') && !isEmpty(ctx.title) && Object.hasOwnProperty.call(ctx, 'value');
}

/**
 * Add context to the test object so it can
 * be displayed in the mochawesome report
 *
 * @param {Object} test object
 * @param {String|Object} context to add
 *        If context is an object, it must have the shape:
 *        {
 *          title: string that is used as context title in the report
 *          value: the context that is to be added
 *        }
 *
 * Usage:
 *
 * it('should test something', function () {
 *   someFunctionThatTestsCode();
 *
 *   addContext(this, 'some context to add');
 *
 *   addContext(this, {
 *     title: 'Expected number of something'
 *     value: 42
 *   });
 *
 *   assert('something');
 * });
 *
 */

var addContext = function addContext() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // Check args to see if we should bother continuing
  if (args.length !== 2 || !isObject(args[0])) {
    log(ERRORS.INVALID_ARGS, 'error');
    return;
  }

  var ctx = args[1];

  // Ensure that context meets the requirements
  if (!_isValidContext(ctx)) {
    log(ERRORS.INVALID_CONTEXT(ctx), 'error');
    return;
  }

  /* Context is valid, now get the test object
   * If `addContext` is called from inside a `beforeEach` or `afterEach`
   * the test object will be `.currentTest`, otherwise just `.test`
   */
  var test = args[0].currentTest || args[0].test;

  if (!test) {
    log(ERRORS.INVALID_TEST, 'error');
    return;
  }

  /* If context is an object, and value is `undefined`
   * change it to 'undefined' so it can be displayed
   * correctly in the report
   */
  if (ctx.title && ctx.value === undefined) {
    ctx.value = 'undefined';
  }

  // Test doesn't already have context -> set it
  if (!test.context) {
    test.context = ctx;
  } else if (Array.isArray(test.context)) {
    // Test has context and context is an array -> push new context
    test.context.push(ctx);
  } else {
    // Test has context and it is not an array -> make it an array, then push new context
    test.context = [test.context];
    test.context.push(ctx);
  }
};

module.exports = addContext;