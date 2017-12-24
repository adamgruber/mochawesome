const sinon = require('sinon');
const proxyquire = require('proxyquire');
const sampleTests = require('./sample-tests');
const sampleSuite = require('./sample-suite');

const utils = proxyquire('../src/utils', {
  uuid: { v4: () => 'fc3f8bee-4feb-4f28-8e27-a680704c9176' }
});

const {
  log,
  getPercentClass,
  cleanCode,
  cleanTest,
  cleanSuite
} = utils;

describe('Mochawesome Utils', () => {
  describe('log', () => {
    const msg = 'Dry land is not a myth!';
    const expected = '[\u001b[90mmochawesome\u001b[39m] Dry land is not a myth!\n';

    beforeEach(() => {
      sinon.spy(console, 'log');
      sinon.spy(console, 'error');
    });

    afterEach(() => {
      console.log.restore();
      console.error.restore();
    });

    it('does not log when quiet option is true', () => {
      log(msg, null, { quiet: true });
      console.log.called.should.be.false();
    });

    it('logs a message, default level: log', () => {
      log(msg);
      console.log.called.should.be.true();
      console.log.args[0][0].should.equal(expected);
    });

    it('logs a message, specified level: error', () => {
      log(msg, 'error');
      console.error.called.should.be.true();
      console.error.args[0][0].should.equal(expected);
    });

    it('logs a stringified object, default level: log', () => {
      log({ msg });
      const exp = `[\u001b[90mmochawesome\u001b[39m] {\n  "msg": "${msg}"\n}\n`;
      console.log.called.should.be.true();
      console.log.args[0][0].should.equal(exp);
    });
  });

  describe('getPercentClass', () => {
    it('should return \'danger\'', () => {
      getPercentClass(50).should.equal('danger');
    });

    it('should return \'warning\'', () => {
      getPercentClass(63).should.equal('warning');
    });

    it('should return \'success\'', () => {
      getPercentClass(85).should.equal('success');
    });
  });

  describe('cleanCode', () => {
    const expected = 'return true;';
    let fnStr;

    it('should clean standard function syntax, single line', () => {
      fnStr = 'function () { return true; }';
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean standard function syntax, multi line', () => {
      fnStr = `function () {
        return true;
      }`;
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean non-standard function syntax', () => {
      fnStr = `function ()
      {
        return true;
      }`;
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean standard function syntax with param', () => {
      fnStr = 'function (done) { return true; }';
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean arrow function syntax, single line', () => {
      fnStr = '() => { return true; }';
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean arrow function syntax, single line no braces', () => {
      fnStr = '() => someFunction(arg)';
      cleanCode(fnStr).should.equal('someFunction(arg)');
    });

    it('should clean arrow function syntax, multi line', () => {
      fnStr = `()=> {
        return true;
      }`;
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean generator function syntax', () => {
      fnStr = `function* () {
        return true;
      }`;
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean non-standard arrow function syntax', () => {
      fnStr = `() => 
      {
        return true;}`;
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean arrow function syntax with param', () => {
      fnStr = '(done) => { return true; }';
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean async standard function syntax', () => {
      fnStr = 'async function () {return true; }';
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean async arrow function syntax', () => {
      fnStr = 'async () => { return true; }';
      cleanCode(fnStr).should.equal(expected);
    });
  });

  describe('cleanTest', () => {
    const config = {};
    const expectedProps = [
      'title',
      'fullTitle',
      'timedOut',
      'duration',
      'state',
      'speed',
      'pass',
      'fail',
      'pending',
      'context',
      'code',
      'err',
      'isRoot',
      'uuid',
      'parentUUID',
      'skipped',
      'isHook'
    ];

    it('returns cleaned passing test', () => {
      const cleaned = cleanTest(sampleTests.passing.raw, config);
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.passing.cleaned);
    });

    it('returns cleaned failing test', () => {
      const cleaned = cleanTest(sampleTests.failing.raw, config);
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.failing.cleaned);
    });

    it('returns cleaned failing test with inline diff', () => {
      const cleaned = cleanTest(sampleTests.failing.raw, { useInlineDiffs: true });
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.failing.cleanedWithInlineDiff);
    });

    it('returns cleaned pending test', () => {
      const cleaned = cleanTest(sampleTests.pending.raw, config);
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.pending.cleaned);
    });

    it('returns cleaned hook', () => {
      const cleaned = cleanTest(sampleTests.hook.raw, config);
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.hook.cleaned);
    });
  });

  describe('cleanSuite', () => {
    const config = {};
    const totalTestsRegistered = { total: 0 };
    const expectedProps = [
      'title',
      'fullFile',
      'file',
      'beforeHooks',
      'afterHooks',
      'tests',
      'suites',
      'passes',
      'failures',
      'pending',
      'skipped',
      'root',
      'uuid',
      'duration',
      'rootEmpty',
      '_timeout'
    ];

    it('cleans a root suite', () => {
      const cleaned = cleanSuite(sampleSuite.one.raw, totalTestsRegistered, config);
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleSuite.one.cleaned);
    });

    it('cleans a non-root suite', () => {
      const cleaned = cleanSuite(sampleSuite.two.raw, totalTestsRegistered, config);
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleSuite.two.cleaned);
    });

    it('cleans an empty suite', () => {
      const cleaned = cleanSuite(sampleSuite.three.raw, totalTestsRegistered, config);
      cleaned.should.equal(sampleSuite.three.cleaned);
    });
  });
});
