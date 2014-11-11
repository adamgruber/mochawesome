var should = require('should');

describe('Master Test Suite', function () {

  describe('Test Suite 1', function () {
    
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });

    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });

  });

  describe('Test Suite 2', function () {
    
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });

    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });

    xit('pending test', function (done) {
      console.log('this test is pending');
      done();
    });

  });

  describe('Test Suite 3', function () {

    // before(function () {
    //   console.log('a');
    // });
    
    it('passing test', function (done) {
      true.should.be.ok;
      done();
    });

    it('failing test', function (done) {
      false.should.be.ok;
      done();
    });

    xit('pending test', function (done) {
      done();
    });

  });
});