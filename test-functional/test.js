const addContext = require('../src/addContext');

function retObj() {
  return {
    employees: {
      employee: [
        {
          id: '1',
          firstName: 'Tom',
          lastName: 'Cruise'
        },
        {
          id: '2',
          firstName: 'Maria',
          lastName: 'Sharapova'
        },
        {
          id: '3',
          firstName: 'James',
          lastName: 'Bond'
        }
      ]
    }
  };
}

describe('Master Test Suite', () => {
  // it('passing test', done => {
  //   (1+1).should.equal(2);
  //   done();
  // });

  describe('Test Suite - Basic', () => {
    it('should be passing test if true is not false', done => {
      (1+1).should.equal(2);
      done();
    });
    it('should fail when returned object does not match expected object', done => {
      const o = retObj();
      o.should.eql({});
      done();
    });
  });

  describe('Test Suite - Nested Suites', () => {
    describe('Nested Test Suite', () => {
      it('should be a passing test', done => {
        (1+1).should.equal(2);
        done();
      });
    });
    it('passing test', function (done) {
      (1+1).should.equal(2);
      addContext(this, 'https://github.com/adamgruber');
      done();
    });
    describe('Nested Test Suite', () => {
      it('passing test', done => {
        (1+1).should.equal(2);
        done();
      });
    });
    it('should be a failing test', function (done) {
      addContext(this, {
        title: 'How I Feel When Tests Fail',
        value: 'http://i.imgur.com/c4jt321.png'
      });
      false.should.equal(true);
      done();
    });
  });

  describe('Test Suite - Nested Suites Failing Before', () => {
    before('nested failing before', () => {
      console.log(a); // eslint-disable-line
    });
    describe('Nested Test Suite', () => {
      it('passing test', done => {
        (1+1).should.equal(2);
        done();
      });
    });
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });
  });

  describe('Test Suite - Failed After', () => {
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });
    xit('pending test', done => {
      done();
    });
    it('failing test', done => {
      false.should.equal(true);
      done();
    });
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });
    xit('pending test', done => {
      done();
    });
    after('failing after hook', () => {
      console.log('a');
    });
  });

  describe('Test Suite - Pass', () => {
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });
  });

  describe('Test Suite - Fail', () => {
    it('failing test', done => {
      false.should.equal(true);
      done();
    });
  });

  describe('Test Suite - Pend', () => {
    xit('pending test', done => {
      (1+1).should.equal(2);
      done();
    });
  });

  describe('Test Suite - Failed Before', () => {
    before('failing before hook', () => {
      console.log(a); // eslint-disable-line
    });
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });

    it('failing test', done => {
      false.should.equal(true);
      done();
    });
  });

  describe('Test Suite - Failed Before and After', () => {
    before('failing before hook', () => {
      console.log(a); // eslint-disable-line
    });
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });

    it('failing test', done => {
      false.should.equal(true);
      done();
    });
    after('failing after hook', () => {
      console.log(a); // eslint-disable-line
    });
  });

  describe('Test Suite - Failed Before Each', () => {
    beforeEach('failing beforeEach hook', () => {
      console.log(a); // eslint-disable-line
    });
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });

    it('failing test', done => {
      false.should.equal(true);
      done();
    });
  });

  describe('Test Suite - Failed After Each', () => {
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });
    xit('pending test', done => {
      done();
    });
    it('failing test', done => {
      false.should.equal(true);
      done();
    });
    it('passing test', done => {
      (1+1).should.equal(2);
      done();
    });
    xit('pending test', done => {
      done();
    });
    afterEach('failing afterEach hook', () => {
      console.log('a');
    });
  });
});
