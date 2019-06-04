const addContext = require('../src/addContext');

describe('addContext', () => {
  let testObj;
  let test;
  let origConsoleError;

  beforeEach(() => {
    origConsoleError = console.error;
    console.error = function () {};
  });

  afterEach(() => {
    console.error = origConsoleError;
  });

  function contextTests() {
    it('as a string', () => {
      addContext(testObj, 'test context');
      test.should.eql({ context: 'test context' });
    });

    it('as an object', () => {
      addContext(testObj, {
        title: 'context title',
        value: true
      });
      test.should.eql({
        context: {
          title: 'context title',
          value: true
        }
      });
    });

    it('as an object with undefined value', () => {
      addContext(testObj, {
        title: 'context title',
        value: undefined
      });
      test.should.eql({
        context: {
          title: 'context title',
          value: 'undefined'
        }
      });
    });

    it('as multiple items', () => {
      addContext(testObj, 'test context 1');
      addContext(testObj, 'test context 2');
      addContext(testObj, { title: 'test context 3', value: true });
      test.should.eql({
        context: [ 'test context 1', 'test context 2', { title: 'test context 3', value: true } ]
      });
    });
  }

  describe('when run inside a test', () => {
    beforeEach(() => {
      testObj = { test: {} };
      test = testObj.test;
    });
    contextTests();
  });

  describe('when run inside a beforeEach', () => {
    beforeEach(() => {
      testObj = { currentTest: {} };
      test = testObj.currentTest;
    });
    contextTests();
  });

  describe('No context is added when', () => {
    beforeEach(() => {
      testObj = { test: {} };
      test = testObj.test;
    });

    it('wrong number of args', () => {
      addContext('');
      test.should.not.have.property('context');
    });

    it('wrong test object', () => {
      addContext({}, 'test context');
      test.should.not.have.property('context');
    });

    it('wrong context, empty string', () => {
      addContext(testObj, '');
      test.should.not.have.property('context');
    });

    it('wrong context object, empty', () => {
      addContext(testObj, {});
      test.should.not.have.property('context');
    });

    it('wrong context object, no title', () => {
      addContext(testObj, { value: 'test' });
      test.should.not.have.property('context');
    });

    it('wrong context object, empty title', () => {
      addContext(testObj, { title: '', value: undefined });
      test.should.not.have.property('context');
    });

    it('wrong context object, no value', () => {
      addContext(testObj, { title: 'context title' });
      test.should.not.have.property('context');
    });
  });
});
