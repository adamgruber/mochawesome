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
  //   true.should.be.ok;
  //   done();
  // });

  describe('Test Suite - Basic', () => {
    it('should be passing test if true is not false', done => {
      true.should.be.ok;
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
        true.should.be.ok;
        done();
      });
    });
    it('passing test', done => {
      true.should.be.ok;
      done();
    });
    describe('Nested Test Suite', () => {
      it('passing test', done => {
        true.should.be.ok;
        done();
      });
    });
    it('should be a failing test', done => {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Nested Suites Failing Before', () => {
    before('nested failing before', () => {
      console.log(a); // eslint-disable-line
    });
    describe('Nested Test Suite', () => {
      it('passing test', done => {
        true.should.be.ok;
        done();
      });
    });
    it('passing test', done => {
      true.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed After', () => {
    it('passing test', done => {
      true.should.be.ok;
      done();
    });
    xit('pending test', done => {
      done();
    });
    it('failing test', done => {
      false.should.be.ok;
      done();
    });
    it('passing test', done => {
      true.should.be.ok;
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
      true.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Fail', () => {
    it('failing test', done => {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Pend', () => {
    xit('pending test', done => {
      true.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed Before', () => {
    before('failing before hook', () => {
      console.log(a); // eslint-disable-line
    });
    it('passing test', done => {
      true.should.be.ok;
      done();
    });

    it('failing test', done => {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed Before and After', () => {
    before('failing before hook', () => {
      console.log(a); // eslint-disable-line
    });
    it('passing test', done => {
      true.should.be.ok;
      done();
    });

    it('failing test', done => {
      false.should.be.ok;
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
      true.should.be.ok;
      done();
    });

    it('failing test', done => {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed After Each', () => {
    it('passing test', done => {
      true.should.be.ok;
      done();
    });
    xit('pending test', done => {
      done();
    });
    it('failing test', done => {
      false.should.be.ok;
      done();
    });
    it('passing test', done => {
      true.should.be.ok;
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
