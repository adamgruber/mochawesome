const addContext = require('../src/addContext');

const sampleObj = {
  employees: {
    employee: [
      {
        id: '1',
        firstName: 'Tom',
        lastName: 'Cruise',
      },
      {
        id: '2',
        firstName: 'Maria',
        lastName: 'Sharapova',
      },
      {
        id: '3',
        firstName: 'James',
        lastName: 'Bond',
      },
    ],
  },
};

function retObj() {
  return sampleObj;
}

describe('Master Test Suite', () => {
  before(function () {
    addContext(this, 'this context is before all tests');
  });

  after(function () {
    addContext(this, 'this context is after all tests');
  });

  describe('Test Suite with Context', () => {
    it('should have text context', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'this is the test context');
      done();
    });
    it('should have url context, no protocol', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'www.apple.com');
      done();
    });
    it('should have url context, with protocol', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'http://www.apple.com');
      done();
    });
    it('should have url context, ftp', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'ftp://www.apple.com');
      done();
    });
    it('should have url context, with title', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, {
        title: 'this is a link',
        value: 'www.apple.com',
      });
      done();
    });
    it('should have json context', function (done) {
      addContext(this, {
        title: 'sample return object',
        value: sampleObj,
      });
      const o = retObj();
      o.should.eql(sampleObj);
      done();
    });
    it('should have array context', function (done) {
      addContext(this, {
        title: 'sample screenshot',
        value: 'http://shushi168.com/data/out/193/37127382-random-image.png',
      });
      addContext(this, {
        title: 'sample return',
        value: { employees: [] },
      });
      (1 + 1).should.equal(2);
      done();
    });
    it('should have text context - image', function (done) {
      addContext(
        this,
        'http://shushi168.com/data/out/193/37127382-random-image.png'
      );
      (1 + 1).should.equal(2);
      done();
    });
    it('should not have context', () => {
      addContext(
        this,
        'http://shushi168.com/data/out/193/37127382-random-image.png'
      );
      (1 + 1).should.equal(2);
    });
  });

  describe('beforeEach Context', () => {
    beforeEach(function () {
      addContext(this, 'this is the beforeEach context');
    });

    it('should have text context beforeEach context', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'this is the test context');
      done();
    });
    it('should have url context, no protocol and beforeEach context', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'www.apple.com');
      done();
    });
  });

  describe('afterEach Context', () => {
    beforeEach(function () {
      addContext(this, 'this is the afterEach context');
    });

    it('should have text context afterEach context', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'this is the test context');
      done();
    });
    it('should have url context, no protocol and afterEach context', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'www.apple.com');
      done();
    });
  });
});
