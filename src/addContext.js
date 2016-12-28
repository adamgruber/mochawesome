const isObject = require('lodash/isObject');
const isEmpty = require('lodash/isEmpty');
const chalk = require('chalk');
const stringify = require('json-stringify-safe');

const errorPrefix = 'Error adding context:';
const ERRORS = {
  INVALID_ARGS: `${errorPrefix} Invalid arguments.`,
  INVALID_CONTEXT: `${errorPrefix} Expected a string or an object of shape { title: string, value: any } but saw:`
};

/**
 * HELPER FUNCTIONS
 */

/* istanbul ignore next */
function log(msg, level) {
  const logMethod = console[level] || console.log;
  let out = msg;
  if (typeof msg === 'object') {
    out = stringify(msg, null, 2);
  }
  logMethod(`[${chalk.gray('mochawesome')}] ${out}\n`);
}

function _isValidContext(ctx) {
  /*
   * Context is valid if any of the following are true:
   * 1. Type is string and it is not empty
   * 2. Type is object and it has properties 'title' and 'value'
   */
  return ((typeof ctx === 'string') && !isEmpty(ctx))
    || (Object.hasOwnProperty.call(ctx, 'title') && Object.hasOwnProperty.call(ctx, 'value'));
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

const addContext = function (...args) {
  // Check args to see if we should bother continuing
  if ((args.length !== 2) || !isObject(args[0]) || !args[0].test) {
    log(ERRORS.INVALID_ARGS, 'error');
    return;
  }

  const ctx = args[1];

  // Ensure that context meets the requirements
  if (!_isValidContext(ctx)) {
    log(`${ERRORS.INVALID_CONTEXT}\n${stringify(ctx, null, 2)}`, 'error');
    return;
  }

  // Context is valid we can proceed
  const test = args[0].test;

  // Test doesn't already have context -> set it
  if (!test.context) {
    test.context = ctx;
  } else if (Array.isArray(test.context)) {
    // Test has context and context is an array -> push new context
    test.context.push(ctx);
  } else {
    // Test has context and it is not an array -> make it an array, then push new context
    test.context = [ test.context ];
    test.context.push(ctx);
  }
};

module.exports = addContext;
