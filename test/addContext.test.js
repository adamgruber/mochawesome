const addContext = require('../src/addContext');

describe('addContext', () => {
  let testObj;
  let activeTest;
  let test;
  let origConsoleError;

  const makeHook = type => ({
    title: `"${type}" hook`,
    body: 'function () {\n    addContext(this, "i\'m in a before hook");\n  }',
    async: 0,
    sync: true,
    timedOut: false,
    pending: false,
    type: 'hook',
    parent: '#<Suite>',
    ctx: '#<Context>',
    file: '/test.js',
    uuid: '9f4e292c-8668-4008-9dc4-589909f94054'
  });

  beforeEach(() => {
    origConsoleError = console.error;
    console.error = function () {};

    activeTest = {
      title: 'sample test',
      body: 'function () {\n    addContext(this, "i\'m in a test");\n    assert(true);\n  }',
      async: 0,
      sync: true,
      timedOut: false,
      pending: false,
      type: 'test',
      file: '/test.js',
      parent: '#<Suite>',
      ctx: '#<Context>'
    };
  });

  afterEach(() => {
    console.error = origConsoleError;
  });

  function contextTests() {
    it('as a string', () => {
      addContext(testObj, 'test context');
      test.should.eql({
        ...test,
        context: 'test context'
      });
    });

    it('as an object', () => {
      addContext(testObj, {
        title: 'context title',
        value: true
      });
      test.should.eql({
        ...test,
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
        ...test,
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
        ...test,
        context: [
          'test context 1',
          'test context 2',
          { title: 'test context 3', value: true }
        ]
      });
    });
  }

  describe('when run inside a test', () => {
    beforeEach(() => {
      testObj = {
        currentTest: undefined,
        test: activeTest
      };
      test = testObj.test;
    });
    contextTests();
  });

  describe('when run inside a before', () => {
    beforeEach(() => {
      testObj = {
        currentTest: activeTest,
        test: makeHook('before all')
      };
      test = testObj.test;
    });
    contextTests();
  });

  describe('when run inside a beforeEach', () => {
    beforeEach(() => {
      testObj = {
        currentTest: activeTest,
        test: makeHook('before each')
      };
      test = testObj.currentTest;
    });
    contextTests();
  });

  describe('when run inside an after', () => {
    beforeEach(() => {
      testObj = {
        currentTest: activeTest,
        test: makeHook('after all')
      };
      test = testObj.test;
    });
    contextTests();
  });

  describe('when run inside an afterEach', () => {
    beforeEach(() => {
      testObj = {
        currentTest: activeTest,
        test: makeHook('after each')
      };
      test = testObj.currentTest;
    });
    contextTests();
  });

  describe('No context is added when', () => {
    beforeEach(() => {
      testObj = {
        test: {
          title: 'sample test'
        }
      };
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
