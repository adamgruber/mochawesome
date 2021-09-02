import isObject from 'lodash/isobject';
import jsonStringify from 'json-stringify-safe';
import Logger from './logger';

const logger = new Logger(console);
const errorPrefix = 'Error adding context:';
const ERRORS = {
  INVALID_ARGS: `${errorPrefix} Invalid arguments.`,
  INVALID_TEST: `${errorPrefix} Invalid test object.`,
  INVALID_CONTEXT: (ctx: Mochawesome.ContextArg) => {
    const expected =
      'Expected a string or an object of shape { title: string, value: any } but saw:';
    return `${errorPrefix} ${expected}\n${jsonStringify(
      ctx,
      (key, val) => (val === undefined ? 'undefined' : val),
      2
    )}`;
  },
};

function _normalizeContext(
  context: Mochawesome.ContextArg
): Mochawesome.Context | undefined {
  // Ensure that context meets the requirements
  if (
    (typeof context === 'string' && !context.trim()) ||
    (typeof context === 'object' && context.title === undefined)
  ) {
    logger.error(ERRORS.INVALID_CONTEXT(context));
    return;
  }

  if (typeof context === 'string') {
    return {
      title: '',
      value: context,
    };
  }

  if (context.value === undefined) {
    return {
      ...context,
      value: 'undefined',
    };
  }

  return context;
}

/**
 * Add context to the test object so it can
 * be displayed in the mochawesome report
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
const addContext = function (
  runnable: MochaRunnable,
  _context: Mochawesome.ContextArg
) {
  // Check args to see if we should bother continuing
  if (!runnable || !_context || !isObject(runnable)) {
    logger.error(ERRORS.INVALID_ARGS);
    return;
  }

  const context = _normalizeContext(_context);
  if (!context) {
    return;
  }

  /*
   * When `addContext` is called from inside a hook the test object
   * will be `.currentTest`, and the hook will be `.test`.
   * Otherwise the test is just `.test` and `.currentTest` is undefined.
   */
  const { currentTest, test: activeTest } = runnable;

  /*
   * For `beforeAll` and `afterAll`, add the context to the hook,
   * otherwise add it to the actual test.
   */
  const isEachHook =
    currentTest &&
    activeTest &&
    /^"(?:before|after)\seach"/.test(activeTest.title);

  const theTest = isEachHook ? currentTest : activeTest;

  if (!theTest) {
    logger.error(ERRORS.INVALID_TEST);
    return;
  }

  // Test doesn't already have context -> set it
  if (!theTest.context) {
    theTest.context = [context];
  } else if (Array.isArray(theTest.context)) {
    // Test has context and context is an array -> push new context
    theTest.context.push(context);
  }
};

export = addContext;
