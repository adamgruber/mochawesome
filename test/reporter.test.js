const Mocha = require('mocha');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Assert = require('assert').AssertionError;
const path = require('path');

const { Runner, Suite, Test } = Mocha;
const makeTest = (title, doneFn) => new Test(title, doneFn);

const outputFileStub = sinon.stub();
const reportStub = sinon.stub();
const logStub = sinon.stub();

const utils = proxyquire('../src/utils', {
  'fs-extra': { outputFile: outputFileStub }
});

utils.log = logStub;

const mochawesome = proxyquire('../src/mochawesome', {
  'mochawesome-report-generator': {
    create: reportStub
  },
  './utils': utils
});

// node throws a warning for unhandled promise rejections
// these are expected in this test so we just handle here
// to quiet the warning
process.on('unhandledRejection', reason => {
  console.error(reason);
  process.exit(0);
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

  describe('Options Handling', () => {
    it('should apply reporter options via environment variables', done => {
      process.env.MOCHAWESOME_REPORTDIR = 'testReportDir/subdir';
      process.env.MOCHAWESOME_INLINEASSETS = 'true';
      process.env.MOCHAWESOME_AUTOOPEN = false;

      mochaReporter = new mocha._reporter(runner);

      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.config.reportDir.should.equal(path.resolve(__dirname, '../testReportDir/subdir'));
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
        mochaReporter.config.reportDir.should.equal(path.resolve(__dirname, '../testReportDir'));
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
    });

    it('should call the reporter done function successfully', () => {
      reportStub.returns(Promise.resolve({}));
      outputFileStub.yields(null, {});
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.neverCalledWith('error').should.equal(true);
      });
    });

    it('should log an error when fs.outputFile fails', () => {
      outputFileStub.yields({ message: 'outputFile failed' });
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      return mochaReporter.done(0, mochaExitFn).then(() => {
        mochaExitFn.args[0][0].should.equal(0);
        logStub.called.should.equal(true);
        logStub.args[0][1].should.equal('error');
      });
    });

    it('should not log when quiet option is true', () => {
      reportStub.returns(Promise.resolve({}));
      outputFileStub.yields(null, {});
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
