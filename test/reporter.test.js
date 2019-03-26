const Mocha = require('mocha');
const createStatsCollector = require('mocha/lib/stats-collector');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Assert = require('assert').AssertionError;
const utils = require('../src/utils');

const { Runner, Suite, Test } = Mocha;
const makeTest = (title, doneFn) => new Test(title, doneFn);

const reportStub = sinon.stub();
const logStub = sinon.stub();

utils.log = logStub;

const baseConfig = {
  quiet: false,
  reportFilename: 'mochawesome',
  saveHtml: true,
  saveJson: true,
  useInlineDiffs: false
};

const mochawesome = proxyquire('../src/mochawesome', {
  'mochawesome-report-generator': {
    create: reportStub
  },
  'mocha/lib/reporters/spec': function Spec() {},
  './utils': utils
});

describe('Mochawesome Reporter', () => {
  let mocha;
  let suite;
  let subSuite;
  let runner;
  let mochaReporter;

  beforeEach(() => {
    mocha = new Mocha({ reporter: mochawesome });
    suite = new Suite('', 'root');
    subSuite = new Suite('Mochawesome Suite', 'root');
    suite.addSuite(subSuite);
    runner = new Runner(suite);
    createStatsCollector(runner);
    mochaReporter = new mocha._reporter(runner, {
      reporterOptions: {
        quiet: true
      }
    });
  });

  describe('Test Handling', () => {
    it('should have 1 test passing', done => {
      const test = makeTest('passing test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        failureCount.should.equal(0);
        mochaReporter.stats.passPercent.should.equal(100);
        done();
      });
    });

    it('should have 1 test failure', done => {
      const error = { expected: { a: 1 }, actual: { a: 2 } };
      const test = makeTest('failing test', tDone => tDone(new Assert(error)));
      subSuite.addTest(test);

      runner.run(failureCount => {
        failureCount.should.equal(1);
        mochaReporter.stats.passPercent.should.equal(0);
        done();
      });
    });

    it('should have 1 test pending', done => {
      const test = makeTest('pending test');
      subSuite.addTest(test);

      runner.run(failureCount => {
        failureCount.should.equal(0);
        mochaReporter.stats.pending.should.equal(1);
        mochaReporter.stats.pendingPercent.should.equal(100);
        done();
      });
    });

    it('should have a mix of tests', done => {
      const error = { expected: 'foo', actual: 'bar' };
      const passTest1 = makeTest('pass1', () => {});
      const passTest2 = makeTest('pass2', () => {});
      const passTest3 = makeTest('pass3', () => {});
      const failTest = makeTest('failing test', tDone => tDone(new Assert(error)));
      [ passTest1, passTest2, passTest3, failTest ].forEach(test => subSuite.addTest(test));

      runner.run(failureCount => {
        mochaReporter.stats.passes.should.equal(3);
        mochaReporter.stats.failures.should.equal(1);
        mochaReporter.stats.passPercent.should.equal(75);
        done();
      });
    });

    it('should handle empty suite', done => {
      runner.run(failureCount => {
        failureCount.should.equal(0);
        done();
      });
    });

    it('should handle suite with file', done => {
      const test = makeTest('test', () => {});
      subSuite.addTest(test);
      subSuite.file = 'testfile.js';
      runner.run(failureCount => {
        mochaReporter.output.results[0].suites[0].fullFile.should.equal('testfile.js');
        done();
      });
    });
  });

  describe('Hook Handling', () => {
    function passingHookTest(hookType, isBefore) {
      it(`${hookType} passing hook`, done => {
        const test = makeTest('passing test', () => {});
        subSuite[hookType](`${hookType} passing hook`, () => {});
        subSuite.addTest(test);
        runner.run(failureCount => {
          const testSuite = mochaReporter.output.results[0].suites[0];
          const { beforeHooks, afterHooks } = testSuite;
          afterHooks.length.should.equal(isBefore ? 0 : 1);
          beforeHooks.length.should.equal(isBefore ? 1 : 0);
          done();
        });
      });
    }

    function failingHookTest(hookType, isBefore) {
      it(`${hookType} failing hook`, done => {
        const test = makeTest('passing test', () => {});
        subSuite[hookType](`${hookType} failing hook`, () => {
          throw new Error('Dummy hook error');
        });
        subSuite.addTest(test);
        runner.run(failureCount => {
          const testSuite = mochaReporter.output.results[0].suites[0];
          const { beforeHooks, afterHooks } = testSuite;
          afterHooks.length.should.equal(isBefore ? 0 : 1);
          beforeHooks.length.should.equal(isBefore ? 1 : 0);
          done();
        });
      });
    }

    [ 'beforeAll', 'beforeEach' ].forEach(type => {
      passingHookTest(type, true);
      failingHookTest(type, true);
    });

    [ 'afterAll', 'afterEach' ].forEach(type => {
      passingHookTest(type, false);
      failingHookTest(type, false);
    });
  });

  describe('Options Handling', () => {
    const makeReporter = opts => new mocha._reporter(runner, opts);
    const expected = opts => Object.assign({}, baseConfig, opts);

    beforeEach(() => {
      subSuite.addTest(makeTest('test', () => {}));
    });

    describe('environment variables', () => {
      beforeEach(() => {
        process.env.MOCHAWESOME_REPORTFILENAME = 'test';
        mochaReporter = makeReporter({});
      });

      afterEach(() => {
        delete process.env.MOCHAWESOME_REPORTFILENAME;
      });

      it('should apply reporter options via environment variables', done => {
        runner.run(failureCount => {
          mochaReporter.config.should.deepEqual(expected({
            reportFilename: 'test'
          }));
          done();
        });
      });
    });

    describe('options object', () => {
      beforeEach(() => {
        process.env.MOCHAWESOME_QUIET = 'false';
        mochaReporter = makeReporter({
          reporterOptions: {
            reportFilename: 'testReportFilename',
            json: 'false',
            margeSpecificOption: 'something'
          }
        });
      });

      it('should apply reporter options via passed in object', done => {
        runner.run(failureCount => {
          mochaReporter.config.should.deepEqual(expected({
            reportFilename: 'testReportFilename',
            saveJson: false
          }));
          done();
        });
      });
    });

    describe('mocha options', () => {
      beforeEach(() => {
        mochaReporter = makeReporter({ useInlineDiffs: true });
      });

      it('should transfer mocha options', done => {
        runner.run(failureCount => {
          mochaReporter.config.should.deepEqual(expected({
            useInlineDiffs: true
          }));
          done();
        });
      });
    });
  });

  describe('Reporter Done Function', () => {
    let mochaExitFn;

    beforeEach(() => {
      subSuite.addTest(makeTest('test', () => {}));
      mochaExitFn = sinon.spy();
      logStub.reset();
      reportStub.reset();
      mochaReporter = new mocha._reporter(runner, {
        reporterOptions: {
          reportDir: 'testDir',
          inlineAssets: true,
          quiet: true
        }
      });
    });

    it('should not have an unhandled error', () => {
      reportStub.returns(Promise.resolve({}));

      return mochaReporter.done(0).then(() => {
        mochaExitFn.called.should.equal(false);
        logStub.neverCalledWith('error').should.equal(true);
      });
    });

    it('should log message when no files generated', () => {
      reportStub.resolves([]);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.args[0][0].should.equal('No files were generated');
      });
    });

    it('should log message when only html file generated', () => {
      reportStub.resolves([ 'html', null ]);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.callCount.should.equal(1);
        logStub.args[0][0].should.equal('Report HTML saved to html');
      });
    });

    it('should log message when only json file generated', () => {
      reportStub.resolves([ null, 'json' ]);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.callCount.should.equal(1);
        logStub.args[0][0].should.equal('Report JSON saved to json');
      });
    });

    it('should log message when html and json files generated', () => {
      reportStub.resolves([ 'html', 'json' ]);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.callCount.should.equal(2);
      });
    });

    it('should pass reporterOptions to the report generator', () => {
      reportStub.resolves([]);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        reportStub.args[0][1].should.deepEqual({
          reportDir: 'testDir',
          inlineAssets: true,
          quiet: true,
          reportFilename: 'mochawesome',
          saveHtml: true,
          saveJson: true
        });
      });
    });

    it('should log an error when report creation fails', () => {
      reportStub.rejects({ message: 'report creation failed' });

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.called.should.equal(true);
        mochaExitFn.args[0][0].should.equal(0);
        logStub.called.should.equal(true);
        logStub.args[0][1].should.equal('error');
      });
    });

    it('should not log when quiet option is true', () => {
      reportStub.resolves([]);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.args[0][2].should.have.property('quiet', true);
      });
    });
  });
});
