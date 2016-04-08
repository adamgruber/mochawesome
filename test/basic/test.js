var should = require('should');

describe('Master Test Suite', function () {
  describe('Test Suite - Basic', function () {
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Nested Suites', function () {
    describe('Nested Test Suite', function () {
      it('passing test', function (done) {
        true.should.be.ok;
        done();
      });
    });
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
    describe('Nested Test Suite', function () {
      it('passing test', function (done) {
        true.should.be.ok;
        done();
      });
    });
    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Nested Suites Failing Before', function () {
    before('nested failing before', function() {
      console.log(a);
    });
    describe('Nested Test Suite', function () {
      it('passing test', function (done) {
        true.should.be.ok;
        done();
      });
    });
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed After', function () {
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
    xit('pending test', function (done) {
      done();
    });
    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
    xit('pending test', function (done) {
      done();
    });
    after('failing after hook', function () {
      console.log('a');
    });
  });

  describe('Test Suite - Pass', function () {
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Fail', function () {
    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Pend', function () {
    xit('pending test', function (done) {
      true.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed Before', function () {
    before('failing before hook', function () {
      console.log(a);
    });
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });

    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed Before and After', function () {
    before('failing before hook', function () {
      console.log(a);
    });
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });

    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
    after('failing after hook', function () {
      console.log(a);
    });
  });

  describe('Test Suite - Failed Before Each', function () {
    beforeEach('failing beforeEach hook', function () {
      console.log(a);
    });
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });

    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
  });

  describe('Test Suite - Failed After Each', function () {
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
    xit('pending test', function (done) {
      done();
    });
    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });
    xit('pending test', function (done) {
      done();
    });
    afterEach('failing afterEach hook', function () {
      console.log('a');
    });
  });
});