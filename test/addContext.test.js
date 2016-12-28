const addContext = require('../src/addContext');

describe('addContext', () => {
  let testObj;
  let test;

  beforeEach(() => {
    testObj = { test: {} };
    test = testObj.test;
  });

  it('should add context as string', () => {
    addContext(testObj, 'test context');
    test.should.eql({ context: 'test context' });
  });

  it('should add context as object', () => {
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

  it('should add multiple context items', () => {
    addContext(testObj, 'test context 1');
    addContext(testObj, 'test context 2');
    addContext(testObj, { title: 'test context 3', value: true });
    test.should.eql({
      context: [ 'test context 1', 'test context 2', { title: 'test context 3', value: true } ]
    });
  });

  describe('No context is added when', () => {
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

    it('wrong context object, no value', () => {
      addContext(testObj, { title: 'context title' });
      test.should.not.have.property('context');
    });
  });
});
