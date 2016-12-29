const Mocha = require('mocha');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Assert = require('assert').AssertionError;

const { Runner, Suite, Test } = Mocha;
const makeTest = (title, doneFn) => new Test(title, doneFn);

const writeFileStub = sinon.stub();
const reportStub = sinon.stub();

const mochawesome = proxyquire('../src/mochawesome', {
  'fs-extra': { outputFile: writeFileStub },
  'mochawesome-report': {
    create: reportStub
  }
});

describe('mochawesome reporter', () => {
  let mocha;
  let suite;
  let subSuite;
  let runner;
  let mochaReporter;

  describe('test handling', () => {
    beforeEach(() => {
      mocha = new Mocha({ reporter: mochawesome });
      suite = new Suite('', 'root');
      subSuite = new Suite('Mochawesome Suite', 'root');
      suite.addSuite(subSuite);
      runner = new Runner(suite);
      mochaReporter = new mocha._reporter(runner);
    });

    it('should have 1 test passing', done => {
      const test = makeTest('passing test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        // console.log(mochaReporter.stats);
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
        // console.log(mochaReporter.stats);
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
        // console.log(mochaReporter.stats);
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
        // console.log(mochaReporter.stats);
        mochaReporter.stats.passes.should.equal(3);
        mochaReporter.stats.failures.should.equal(1);
        mochaReporter.stats.passPercent.should.equal(75);
        mochaReporter.stats.passPercentClass.should.equal('warning');
        done();
      });
    });

    it('should handle empty suite', done => {
      runner.run(failureCount => {
        // console.log(mochaReporter.stats);
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

  describe('options handling', () => {
    beforeEach(() => {
      mocha = new Mocha({ reporter: mochawesome });
      suite = new Suite('', 'root');
      subSuite = new Suite('Mochawesome Suite', 'root');
      suite.addSuite(subSuite);
      runner = new Runner(suite);
    });

    it('should apply reporter options via environment variables', done => {
      process.env.MOCHAWESOME_REPORTDIR = 'testReportDir';
      process.env.MOCHAWESOME_INLINEASSETS = 'true';
      process.env.MOCHAWESOME_AUTOOPEN = false;

      mochaReporter = new mocha._reporter(runner);

      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        // console.log(mochaReporter.config);
        mochaReporter.config.reportDir.should.equal('testReportDir');
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
          reportTitle: 'testReportTitle',
          inlineAssets: 'true',
          autoOpen: true,
          quiet: true
        }
      });

      const test = makeTest('test', () => {});
      subSuite.addTest(test);


      runner.run(failureCount => {
        mochaReporter.config.reportDir.should.equal('testReportDir');
        mochaReporter.config.reportTitle.should.equal('testReportTitle');
        mochaReporter.config.inlineAssets.should.equal(true);
        mochaReporter.config.autoOpen.should.equal(true);
        mochaReporter.config.quiet.should.equal(true);
        done();
      });
    });
  });

  describe('reporter done function', () => {
    beforeEach(() => {
      mocha = new Mocha({ reporter: mochawesome });
      suite = new Suite('', 'root');
      subSuite = new Suite('Mochawesome Suite', 'root');
      suite.addSuite(subSuite);
      runner = new Runner(suite);
      mochaReporter = new mocha._reporter(runner);
    });

    it('should call the reporter done function successfully', done => {
      reportStub.returns(Promise.resolve({}));
      writeFileStub.yields(null, {});
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.done(failureCount, done);
      });
    });

    it('should log an error when fs.outputFile fails', done => {
      writeFileStub.yields({ message: 'outputFile failed' });
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.done(failureCount, done);
      });
    });

    it('should log an error when report creation fails', done => {
      writeFileStub.yields(null, {});
      reportStub.returns(Promise.reject({ message: 'report creation failed' }));
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.done(failureCount, done);
      });
    });

    it('should not log when quiet option is true', done => {
      reportStub.returns(Promise.resolve({}));
      writeFileStub.yields(null, {});
      const test = makeTest('test', () => {});
      subSuite.addTest(test);
      mochaReporter = new mocha._reporter(runner, {
        reporterOptions: { quiet: true }
      });

      runner.run(failureCount => {
        mochaReporter.done(failureCount, done);
      });
    });
  });
});
