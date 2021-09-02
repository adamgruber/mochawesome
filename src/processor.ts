import isFunction from 'lodash/isfunction';
import { stringify as mochaStringify } from 'mocha/lib/utils';
import jsonStringify from 'json-stringify-safe';
import { Change, createPatch, diffWordsWithSpace } from 'diff';
import stripAnsi from 'strip-ansi';
import stripFnStart from './stripFnStart';

class RunProcessor {
  config: Mochawesome.Config;
  processed: Mochawesome.Results;
  rootSuite: MochaSuite;

  constructor(rootSuite: Mocha.Suite, config: Mochawesome.Config) {
    this.config = config;
    this.rootSuite = (rootSuite as unknown) as MochaSuite;
    this.processed = {
      suites: [],
      tests: [],
    };

    this.processTest = this.processTest.bind(this);
    this.processSuite = this.processSuite.bind(this);
  }

  run() {
    this.walkRunPostorder();
    return this.processed;
  }

  /**
   * Check that a / b have the same type.
   */
  isSameType(a: any, b: any) {
    const objToString = Object.prototype.toString;
    return objToString.call(a) === objToString.call(b);
  }

  createDiffFromError({
    actual,
    expected,
    showDiff,
  }: MochaError): Change[] | string | undefined {
    if (
      !showDiff ||
      !this.isSameType(actual, expected) ||
      actual === undefined ||
      expected === undefined
    ) {
      return;
    }

    const actualStr = mochaStringify(actual);
    const expectedStr = mochaStringify(expected);
    return this.config.useInlineDiffs
      ? diffWordsWithSpace(actualStr, expectedStr)
      : createPatch('string', actualStr, expectedStr)
          .split('\n')
          .splice(4)
          .map(line => {
            if (line.match(/@@/)) {
              return null;
            }
            if (line.match(/\\ No newline/)) {
              return null;
            }
            return line.replace(/^(-|\+)/, '$1 ');
          })
          .filter(line => typeof line !== 'undefined' && line !== null)
          .join('\n');
  }

  /**
   * Return a normalized error object
   */
  normalizeErr(err?: MochaError) {
    if (!err) {
      return;
    }

    const { name, message, stack } = err;
    let errMessage: string | undefined;

    // Assertion libraries do not output consitent error objects so in order to
    // get a consistent message object we need to create it ourselves
    if (name && message) {
      errMessage = `${name}: ${stripAnsi(message)}`;
    } else if (stack) {
      errMessage = stack.replace(/\n.*/g, '');
    }

    return {
      message: errMessage,
      estack: stack && stripAnsi(stack),
      diff: this.createDiffFromError(err),
    };
  }

  /**
   * Strip the function definition from `str`,
   * and re-indent for pre whitespace.
   */
  cleanCode(code: string): string {
    let cleaned = code
      .replace(/\r\n|[\r\n\u2028\u2029]/g, '\n') // unify linebreaks
      .replace(/^\uFEFF/, ''); // replace zero-width no-break space

    cleaned = stripFnStart(cleaned) // replace function declaration
      .replace(/\)\s*\)\s*$/, ')') // replace closing paren
      .replace(/\s*};?\s*$/, ''); // replace closing bracket

    // Preserve indentation by finding leading tabs/spaces
    // and removing that amount of space from each line
    const spacesMatch = cleaned.match(/^\n?( *)/);
    const numSpaces = spacesMatch ? spacesMatch[1].length : 0;
    const tabsMatch = cleaned.match(/^\n?(\t*)/);
    const numTabs = tabsMatch ? tabsMatch[1].length : 0;
    /* istanbul ignore next */
    const indentRegex = new RegExp(
      `^\n?${numTabs ? '\t' : ' '}{${numTabs || numSpaces}}`,
      'gm'
    );

    cleaned = cleaned.replace(indentRegex, '').trim();
    return cleaned;
  }

  processSuite(suite: MochaSuite): Mochawesome.ProcessedSuite {
    let duration = 0;

    suite.tests?.forEach(test => {
      const processedTest = this.processTest(test);
      this.processed.tests.push(processedTest);
      duration += processedTest.duration;
    });

    const processHook = (hook: MochaHook) => {
      this.processed.tests.push(this.processTest(hook));
    };
    suite._beforeAll?.forEach(processHook);
    suite._beforeEach?.forEach(processHook);
    suite._afterAll?.forEach(processHook);
    suite._afterEach?.forEach(processHook);

    return {
      id: suite.id,
      title: stripAnsi(suite.title),
      fullFile: suite.file,
      file: suite.file?.replace(process.cwd(), ''),
      duration,
      isRoot: suite.root,
      parent: suite.parent?.id,
    };
  }

  processTest(test: MochaTest | MochaHook): Mochawesome.ProcessedTest {
    const title = stripAnsi(test.title);
    let testType: Mochawesome.TestType = 'test';
    if (test.type === 'hook') {
      const hookTypes: { [key: string]: Mochawesome.TestType } = {
        '"before each"': 'beforeEach',
        '"before all"': 'beforeAll',
        '"after each"': 'afterEach',
        '"after all"': 'afterAll',
      };
      Object.keys(hookTypes).forEach(prefix => {
        if (title.startsWith(prefix)) {
          testType = hookTypes[prefix];
        }
      });
    }

    return {
      id: test.id,
      title,
      fullTitle: isFunction(test.fullTitle)
        ? stripAnsi(test.fullTitle())
        : title,
      duration: test.duration || 0,
      timeout: test.timeout(),
      timedOut: test.timedOut,
      retries: test.retries(),
      state:
        test.type === 'test' && !test.state && !test.pending
          ? 'didNotRun'
          : test.state,
      speed: 'speed' in test ? test.speed : undefined,
      context: jsonStringify(test.context, null, 2),
      code: this.config.code ? this.cleanCode(test.body) : undefined,
      err: this.normalizeErr(test.err),
      parent: test.parent?.id,
      type: testType,
    };
  }

  walkRunPostorder(suite: MochaSuite = this.rootSuite) {
    if (suite.suites.length) {
      suite.suites.forEach(subSuite => this.walkRunPostorder(subSuite));
    }
    this.processed.suites.push(this.processSuite(suite));
  }
}

export default RunProcessor;
