require('../src/register');
const Mochawesome = require('../src/mochawesome');
const { EventEmitter } = require('events');
const Mocha = require('mocha');
const { Runner, Suite, Test, Hook } = Mocha;
const { constants } = Runner;

describe('Parallel Mode', () => {
  const noop = () => {};

  describe("Mocha's worker", () => {
    [['file', '/test/test.js']].forEach(([field, expected]) => {
      it(`should serialize the suite's ${field}`, () => {
        // arrange
        const given = { suiteName: 'FAKE TEST' };
        const suite = new Suite(given.suiteName);
        suite[field] = expected;

        // act
        const actual = suite.serialize();

        // assert
        actual.title.should.equal(given.suiteName);
        actual[field].should.equal(expected);
      });
    });

    [
      ['body', '() => console.log(a)'],
      ['state', 'failed'],
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
      const rootSuite = { title: '', root: true };
      const sub1Suite = new Suite('Sub #1 Suite');
      const sub1BeforeAll = new Hook(
        `"before all" hook: before hook in "${sub1Suite.title}"`,
        noop
      );
      const sub1BeforeEach = new Hook(
        `"before each" hook: before hook in "${sub1Suite.title}"`,
        noop
      );
      const sub1TestPass = new Test('Sub #1 Suite Test Pass', noop);
      const sub1TestFail = new Test('Sub #1 Suite Test Fail', noop);
      const sub1TestPending = new Test('Sub #1 Suite Test Pending', noop);
      const sub1AfterEach = new Hook(
        `"after each" hook: before hook in "${sub1Suite.title}"`,
        noop
      );
      const sub1AfterAll = new Hook(
        `"after all" hook: before hook in "${sub1Suite.title}"`,
        noop
      );
      const sub2Suite = new Suite('Sub #2 Suite');
      const sub2TestPass = new Test('Sub #2 Suite Test Pass', noop);
      const sub2TestFail = new Test('Sub #2 Suite Test Fail', noop);
      const sub2TestPending = new Test('Sub #2 Suite Test Pending', noop);
      const sub2AfterEach = new Hook(
        `"after each" hook: before hook in "${sub2Suite.title}"`,
        noop
      );

      // act
      runner.emit(constants.EVENT_RUN_BEGIN);
      runner.emit(constants.EVENT_SUITE_BEGIN, rootSuite);
      runner.emit(constants.EVENT_SUITE_BEGIN, sub1Suite);
      runner.emit(constants.EVENT_HOOK_END, sub1BeforeAll);
      runner.emit(constants.EVENT_HOOK_END, sub1BeforeEach);
      runner.emit(constants.EVENT_TEST_BEGIN, sub1TestPass);
      runner.emit(constants.EVENT_TEST_PASS, sub1TestPass);
      runner.emit(constants.EVENT_HOOK_END, sub1AfterEach);
      runner.emit(constants.EVENT_TEST_BEGIN, sub1TestFail);
      runner.emit(constants.EVENT_TEST_FAIL, sub1TestFail);
      runner.emit(constants.EVENT_HOOK_END, sub1AfterEach);
      runner.emit(constants.EVENT_TEST_BEGIN, sub1TestPending);
      runner.emit(constants.EVENT_TEST_PENDING, sub1TestPending);
      runner.emit(constants.EVENT_HOOK_END, sub1AfterEach);
      runner.emit(constants.EVENT_HOOK_END, sub1AfterAll);
      runner.emit(constants.EVENT_SUITE_END, { title: sub1Suite.title });
      runner.emit(constants.EVENT_SUITE_BEGIN, sub2Suite);
      runner.emit(constants.EVENT_TEST_BEGIN, sub2TestPass);
      runner.emit(constants.EVENT_TEST_PASS, sub2TestPass);
      runner.emit(constants.EVENT_TEST_FAIL, sub2AfterEach);
      runner.emit(constants.EVENT_TEST_BEGIN, sub2TestFail);
      runner.emit(constants.EVENT_TEST_FAIL, sub2TestFail);
      runner.emit(constants.EVENT_TEST_FAIL, sub2AfterEach);
      runner.emit(constants.EVENT_TEST_BEGIN, sub2TestPending);
      runner.emit(constants.EVENT_TEST_PENDING, sub2TestPending);
      runner.emit(constants.EVENT_TEST_FAIL, sub2AfterEach);
      runner.emit(constants.EVENT_SUITE_END, { title: sub2Suite.title });
      runner.emit(constants.EVENT_SUITE_END, { title: rootSuite.title });
      runner.emit(constants.EVENT_RUN_END);

      // assert
      mochaReporter.output.should.be.ok();
      mochaReporter.output.results.should.containDeep([
        {
          suites: [
            {
              uuid: sub1Suite.uuid,
              suites: [],
              beforeHooks: [
                { title: sub1BeforeAll.title },
                { title: sub1BeforeEach.title },
              ],
              tests: [
                { uuid: sub1TestPass.uuid },
                { uuid: sub1TestFail.uuid },
                { uuid: sub1TestPending.uuid },
              ],
              afterHooks: [
                { title: sub1AfterAll.title },
                { title: sub1AfterEach.title },
              ],
            },
            {
              uuid: sub2Suite.uuid,
              suites: [],
              tests: [
                { uuid: sub2TestPass.uuid },
                { uuid: sub2TestFail.uuid },
                { uuid: sub2TestPending.uuid },
              ],
              afterHooks: [{ title: sub2AfterEach.title }],
            },
          ],
          tests: [],
        },
      ]);
    });
  });
});
