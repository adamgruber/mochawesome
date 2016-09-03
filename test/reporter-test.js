const Mocha = require('mocha');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const { Runner, Suite, Test } = Mocha;
const makeTest = (title, doneFn) => new Test(title, doneFn);

const writeFileStub = sinon.stub();
const mkdirpStub = sinon.stub();

const mochawesome = proxyquire('../lib/mochawesome', {
  fs: { writeFile: writeFileStub },
  mkdirp: mkdirpStub
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
      const error = { message: 'oh shit', stack: {} };
      const test = makeTest('failing test', tDone => tDone(new Error(error)));
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
      const error = { message: 'oh shit', stack: {} };
      const passTest1 = makeTest('pass1', () => {});
      const passTest2 = makeTest('pass2', () => {});
      const passTest3 = makeTest('pass3', () => {});
      const failTest = makeTest('failing test', tDone => tDone(new Error(error)));
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
          autoOpen: true
        }
      });

      const test = makeTest('test', () => {});
      subSuite.addTest(test);


      runner.run(failureCount => {
        // console.log(mochaReporter.config);
        mochaReporter.config.reportDir.should.equal('testReportDir');
        mochaReporter.config.reportTitle.should.equal('testReportTitle');
        mochaReporter.config.inlineAssets.should.equal(true);
        mochaReporter.config.autoOpen.should.equal(true);
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

    afterEach(() => {

    });

    it('should call the reporter done function successfully', done => {
      writeFileStub.yields(null, {});
      mkdirpStub.yields(null, {});
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.done(failureCount, done);
      });
    });

    it('should log an error when mkdirp fails', done => {
      writeFileStub.yields(null, {});
      mkdirpStub.yields({ message: 'mkdirp failed' });
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.done(failureCount, done);
      });
    });

    it('should log an error when fs.writeFile fails', done => {
      writeFileStub.yields({ message: 'writeFile failed' });
      mkdirpStub.yields(null, {});
      const test = makeTest('test', () => {});
      subSuite.addTest(test);

      runner.run(failureCount => {
        mochaReporter.done(failureCount, done);
      });
    });
  });
});
