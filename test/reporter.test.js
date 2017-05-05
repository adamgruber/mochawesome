const Mocha = require('mocha');
const sinon = require('sinon');
const path = require('path');
const proxyquire = require('proxyquire');
const Assert = require('assert').AssertionError;
const utils = require('../src/utils');

const { Runner, Suite, Test } = Mocha;
const makeTest = (title, doneFn) => new Test(title, doneFn);

const reportStub = sinon.stub();
const logStub = sinon.stub();

utils.log = logStub;

const config = proxyquire('../src/config', {
  'mochawesome-report-generator': {
    getBaseConfig: () => ({
      reportDir: 'mochawesome-report',
      reportTitle: process.cwd().split(path.sep).pop(),
      reportPageTitle: 'Mochawesome Report',
      inline: false,
      inlineAssets: false,
      charts: true,
      enableCharts: true,
      code: true,
      enableCode: true,
      autoOpen: false,
      overwrite: true,
      timestamp: false,
      ts: false,
      dev: false
    })
  }
});

const mochawesome = proxyquire('../src/mochawesome', {
  'mochawesome-report-generator': {
    create: reportStub
  },
  './config': config,
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
        mochaReporter.stats.passPercentClass.should.equal('success');
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
        mochaReporter.stats.passPercentClass.should.equal('danger');
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
        mochaReporter.stats.passPercentClass.should.equal('warning');
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
        const output = JSON.parse(mochaReporter.output);
        output.suites.suites[0].fullFile.should.equal('testfile.js');
        done();
      });
    });
  });

  describe('Hook Handling', () => {
    it('Before each failing hook', done => {
      const test = makeTest('passing test', () => {});
      subSuite.beforeEach('Before Each failure', () => {
        throw new Error('Dummy hook error');
      });
      subSuite.addTest(test);
      runner.run(failureCount => {
        mochaReporter.runner.suite.suites[0].hasBeforeFailedHooks.should.equal(true);
        mochaReporter.runner.suite.suites[0].beforeFailedHooks.length.should.equal(1);
        done();
      });
    });

    it('Before all failing hook', done => {
      const test = makeTest('passing test', () => {});
      subSuite.beforeAll('Before All failure', () => {
        throw new Error('Dummy hook error');
      });
      subSuite.addTest(test);
      runner.run(failureCount => {
        mochaReporter.runner.suite.suites[0].hasBeforeFailedHooks.should.equal(true);
        mochaReporter.runner.suite.suites[0].beforeFailedHooks.length.should.equal(1);
        done();
      });
    });

    it('After each failing hook', done => {
      const test = makeTest('passing test', () => {});
      subSuite.afterEach('After Each failure', () => {
        throw new Error('Dummy hook error');
      });
      subSuite.addTest(test);
      runner.run(failureCount => {
        mochaReporter.runner.suite.suites[0].hasAfterFailedHooks.should.equal(true);
        mochaReporter.runner.suite.suites[0].afterFailedHooks.length.should.equal(1);
        done();
      });
    });

    it('After all failing hook', done => {
      const test = makeTest('passing test', () => {});
      subSuite.afterAll('After all failure', () => {
        throw new Error('Dummy hook error');
      });
      subSuite.addTest(test);
      runner.run(failureCount => {
        mochaReporter.runner.suite.suites[0].hasAfterFailedHooks.should.equal(true);
        mochaReporter.runner.suite.suites[0].afterFailedHooks.length.should.equal(1);
        done();
      });
    });

    it('Should not have skipped hook in the report', done => {
      const error = { expected: { a: 1 }, actual: { a: 2 } };
      const test = makeTest('failing test', tDone => tDone(new Assert(error)));
      subSuite.afterAll('Skipped hook', () => {});
      subSuite.addTest(test);
      runner.run(failureCount => {
        mochaReporter.runner.suite.suites[0].hasAfterFailedHooks.should.equal(false);
        mochaReporter.runner.suite.suites[0].afterFailedHooks.length.should.equal(0);
        mochaReporter.runner.suite.suites[0].hasBeforeFailedHooks.should.equal(false);
        mochaReporter.runner.suite.suites[0].beforeFailedHooks.length.should.equal(0);
        done();
      });
    });
  });

  describe('Options Handling', () => {
    it('should apply reporter options via environment variables', done => {
      process.env.MOCHAWESOME_REPORTDIR = 'testReportDir/subdir';
      process.env.MOCHAWESOME_INLINEASSETS = 'true';
      process.env.MOCHAWESOME_AUTOOPEN = false;

      mochaReporter = new mocha._reporter(runner);

      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.config.reportDir.should.equal('testReportDir/subdir');
        mochaReporter.config.inlineAssets.should.equal(true);
        mochaReporter.config.autoOpen.should.equal(false);
        done();
      });
    });

    it('should apply reporter options via passed in object', done => {
      process.env.MOCHAWESOME_INLINEASSETS = false;
      process.env.MOCHAWESOME_AUTOOPEN = false;

      mochaReporter = new mocha._reporter(runner, {
        reporterOptions: {
          reportDir: 'testReportDir',
          reportFilename: 'testReportFilename',
          reportTitle: 'testReportTitle',
          inlineAssets: 'true',
          enableCharts: 'true',
          enableTestCode: false,
          autoOpen: true
        }
      });

      const test = makeTest('test', () => {});
      subSuite.addTest(test);


      runner.run(failureCount => {
        mochaReporter.config.reportDir.should.equal('testReportDir');
        mochaReporter.config.reportFilename.should.equal('testReportFilename');
        mochaReporter.config.reportTitle.should.equal('testReportTitle');
        mochaReporter.config.inlineAssets.should.equal(true);
        mochaReporter.config.enableCharts.should.equal(true);
        mochaReporter.config.enableCode.should.equal(false);
        mochaReporter.config.autoOpen.should.equal(true);
        done();
      });
    });
  });

  describe('Reporter Done Function', () => {
    let mochaExitFn;

    beforeEach(() => {
      mochaExitFn = sinon.spy();
      logStub.reset();
      reportStub.reset();
    });

    it('should not have an unhandled error', () => {
      reportStub.returns(Promise.resolve({}));
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      return mochaReporter.done(0).then(() => {
        mochaExitFn.called.should.equal(false);
        logStub.neverCalledWith('error').should.equal(true);
      });
    });

    it('should call the reporter done function successfully', () => {
      reportStub.resolves([]);
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.neverCalledWith('error').should.equal(true);
      });
    });

    it('should log an error when report creation fails', () => {
      reportStub.rejects({ message: 'report creation failed' });
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.called.should.equal(true);
        mochaExitFn.args[0][0].should.equal(0);
        logStub.called.should.equal(true);
        logStub.args[0][1].should.equal('error');
      });
    });

    it('should not log when quiet option is true', () => {
      reportStub.resolves([]);
      const test = makeTest('test', () => {});
      subSuite.addTest(test);
      mochaReporter = new mocha._reporter(runner, {
        reporterOptions: { quiet: true }
      });

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.args[0][2].should.have.property('quiet', true);
      });
    });
  });
});
