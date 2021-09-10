require('../src/register');
const Mochawesome = require('../src/mochawesome');
const { EventEmitter } = require('events');
const Mocha = require('mocha');
const { Runner, Suite, Test, Hook } = Mocha;
const { constants } = Runner;

describe('Parallel Mode', () => {
  const noop = () => {};

  describe("Mocha's worker", () => {
    [
      ['file', '/test/test.js'],
      ['suites', [new Suite('FAKE SUB-SUITE')]],
      ['tests', [new Test('FAKE TEST')]],
      ['_beforeAll', [new Hook('FAKE BEFORE_ALL HOOK')]],
      ['_beforeEach', [new Hook('FAKE BEFORE_EACH HOOK')]],
      ['_afterEach', [new Hook('FAKE AFTER_EACH HOOK')]],
      ['_afterAll', [new Hook('FAKE AFTER_ALL HOOK')]],
    ].forEach(([field, expected]) => {
      const withParent = (parent, item) => {
        return Array.isArray(item)
          ? item.map(it => {
              it.parent = parent;
              return it;
            })
          : item;
      };
      const pick = (name, source) => source.map(it => it[name]);

      it(`should serialize the suite's ${field}`, () => {
        // arrange
        const given = { suiteName: 'FAKE SUITE' };
        const suite = new Suite(given.suiteName);
        suite[field] = withParent(suite, expected);

        // act
        const actual = suite.serialize()[field];

        // assert
        if (Array.isArray(expected)) {
          pick('title', actual).should.deepEqual(pick('title', expected));
        } else {
          actual.should.equal(expected);
        }
      });
    });

    [
      ['body', '() => console.log(a)'],
      ['state', 'failed'],
      ['context', 'https://example.com'],
    ].forEach(([field, expected]) => {
      it(`should serialize the hook's ${field}`, () => {
        // arrange
        const given = { hookName: 'FAKE HOOK' };
        const hook = new Hook(given.hookName, noop);
        hook.parent = new Suite('FAKE SUITE');
        hook[field] = expected;

        // act
        const actual = hook.serialize();

        // assert
        actual.title.should.equal(given.hookName);
        actual[field].should.equal(expected);
      });
    });

    it(`should serialize the hook's full title`, () => {
      // arrange
      const given = { hookName: 'FAKE HOOK', suiteName: 'FAKE SUITE' };
      const hook = new Hook(given.hookName, noop);
      hook.parent = new Suite(given.suiteName);

      // act
      const actual = hook.serialize()["$$fullTitle"];

      // assert
      actual.should.equal(hook.fullTitle());
      actual.should.equal([ given.suiteName, given.hookName ].join(' '));
    });

    it(`should serialize the hook's err`, () => {
      // arrange
      const given = {
        hookName: 'FAKE HOOK',
        suiteName: 'FAKE SUITE',
        error: Object.assign(new Error("FAKE ERROR"), { fake: true })
      };
      const hook = new Hook(given.hookName, noop);
      hook.parent = new Suite(given.suiteName);
      hook.err = given.error;

      // act
      const actual = hook.serialize()["err"];

      // assert
      actual.should.not.equal(given.error);
      actual.should.deepEqual({
        name: given.error.name,
        message: given.error.message,
        stack: given.error.stack,
        fake: true
      });
    });

    [
      ['context', 'FAKE CONTEXT'],
      ['pending', Math.random() > 0.5],
    ].forEach(([field, expected]) => {
      it(`should serialize the test's ${field}`, () => {
        // arrange
        const given = { testName: 'FAKE TEST' };
        const test = new Test(given.testName, noop);
        test.parent = new Suite('FAKE SUITE');
        test[field] = expected;

        // act
        const actual = test.serialize();

        // assert
        actual.type.should.equal('test');
        actual.title.should.equal(given.testName);
        actual[field].should.equal(expected);
      });
    });

    it(`should serialize the test's err`, () => {
      // arrange
      const given = {
        testName: 'FAKE TEST',
        suiteName: 'FAKE SUITE',
        error: Object.assign(new Error("FAKE ERROR"), { fake: true })
      };
      const test = new Test(given.testName, noop);
      test.parent = new Suite(given.suiteName);
      test.err = given.error;

      // act
      const actual = test.serialize()["err"];

      // assert
      actual.should.not.equal(given.error);
      actual.should.deepEqual({
        name: given.error.name,
        message: given.error.message,
        stack: given.error.stack,
        fake: true
      });
    });
  });

  describe('Mochawesome Reporter', () => {
    let suite, runner, mochaReporter;

    class ParallelBufferedRunner extends EventEmitter {
      constructor(suite) {
        super({ captureRejections: true });
        this.suite = suite;
      }

      on(event, listener) {
        return this.addListener(event, listener);
      }

      off(event, listener) {
        return this.removeListener(event, listener);
      }

      once(event, listener) {
        const callback = ev => {
          this.off(event, callback);
          listener(ev);
        };
        return this.on(event, callback);
      }
    }

    beforeEach(() => {
      suite = new Suite('');
      suite.root = true;
      runner = new ParallelBufferedRunner(suite);
      mochaReporter = new Mochawesome(runner, {
        reporterOptions: {
          consoleReporter: 'none',
          quiet: true,
        },
      });
    });

    it('should collect events from workers and build the suite', async () => {
      // arrange
      const rootSuite = new Suite('', {}, true);

      const sub1Suite = new Suite('Sub #1 Suite');
      sub1Suite.beforeAll(sub1Suite.title, noop);
      sub1Suite.beforeEach(sub1Suite.title, noop);
      sub1Suite.addTest(new Test('Test Pass', noop));
      sub1Suite.addTest(new Test('Test Fail', noop));
      sub1Suite.addTest(new Test('Test Pending', noop));
      sub1Suite.afterEach(sub1Suite.title, noop);
      sub1Suite.afterAll(sub1Suite.title, noop);
      rootSuite.addSuite(sub1Suite);

      const sub2Suite = new Suite('Sub #2 Suite');
      sub2Suite.beforeAll(sub2Suite.title, noop);
      sub2Suite.beforeEach(sub2Suite.title, noop);
      sub2Suite.addTest(new Test('Test Pass', noop));
      sub2Suite.addTest(new Test('Test Fail', noop));
      sub2Suite.addTest(new Test('Test Pending', noop));
      sub2Suite.afterEach(sub2Suite.title, noop);
      sub2Suite.afterAll(sub2Suite.title, noop);
      rootSuite.addSuite(sub2Suite);

      // act
      runner.emit(constants.EVENT_RUN_BEGIN);
      runner.emit(constants.EVENT_SUITE_BEGIN, rootSuite);
      runner.emit(constants.EVENT_RUN_END);

      // assert
      mochaReporter.output.should.be.ok();

      const dumpSuite = (suite) => ({
        title: suite.title,
        suites: suite.suites.map(it => dumpSuite(it)),
        tests: suite.tests.map(it => ({ title: it.title })),
        beforeHooks: [
          ...suite._beforeAll.map(it => ({ title: it.title })),
          ...suite._beforeEach.map(it => ({ title: it.title })),
        ],
        afterHooks: [
          ...suite._afterAll.map(it => ({ title: it.title })),
          ...suite._afterEach.map(it => ({ title: it.title })),
        ],
      });
      mochaReporter.output.results.should.containDeep([
        dumpSuite(rootSuite)
      ]);
    });
  });
});
