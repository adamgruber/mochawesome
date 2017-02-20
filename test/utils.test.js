const cloneDeep = require('lodash/cloneDeep');
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
  removeAllPropsFromObjExcept,
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

  describe('removeAllPropsFromObjExcept', () => {
    it('should remove object properties', () => {
      const obj = {
        foo: 'foo',
        bar: 'bar',
        baz: 'baz'
      };
      removeAllPropsFromObjExcept(obj, [ 'foo' ]);
      obj.should.have.property('foo');
      obj.should.not.have.properties([ 'bar', 'baz' ]);
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

    it('should clean arrow function syntax, single line', () => {
      fnStr = '() => { return true; }';
      cleanCode(fnStr).should.equal(expected);
    });

    it('should clean arrow function syntax, multi line', () => {
      fnStr = `()=> {
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
  });

  describe('cleanTest', () => {
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
      'skipped'
    ];

    it('returns cleaned passing test', () => {
      const cleaned = cleanTest(sampleTests.passing.raw);
      delete cleaned.err.stack;
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.passing.cleaned);
    });

    it('returns cleaned failing test', () => {
      const cleaned = cleanTest(sampleTests.failing.raw);
      delete cleaned.err.stack;
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.failing.cleaned);
    });

    it('returns cleaned pending test', () => {
      const cleaned = cleanTest(sampleTests.pending.raw);
      delete cleaned.err.stack;
      cleaned.should.have.properties(expectedProps);
      cleaned.should.deepEqual(sampleTests.pending.cleaned);
    });
  });

  describe('cleanSuite', () => {
    const totalTestsRegistered = { total: 0 };
    const expectedProps = [
      'title',
      'fullFile',
      'file',
      'tests',
      'suites',
      'passes',
      'failures',
      'pending',
      'skipped',
      'hasTests',
      'hasSuites',
      'totalTests',
      'totalPasses',
      'totalFailures',
      'totalPending',
      'totalSkipped',
      'hasPasses',
      'hasFailures',
      'hasPending',
      'hasSkipped',
      'root',
      'uuid',
      'duration',
      'rootEmpty',
      '_timeout'
    ];

    it('cleans a root suite', () => {
      const s = cloneDeep(sampleSuite.one.raw);
      cleanSuite(s, totalTestsRegistered);
      s.should.have.properties(expectedProps);
      s.should.deepEqual(sampleSuite.one.cleaned);
    });

    it('cleans a non-root suite', () => {
      const s = cloneDeep(sampleSuite.two.raw);
      cleanSuite(s, totalTestsRegistered);
      s.should.have.properties(expectedProps);
      s.should.deepEqual(sampleSuite.two.cleaned);
    });
  });
});
