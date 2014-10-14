var should = require('should');

describe('Master Test Suite', function () {

  describe('Test Suite 1', function () {
    
    it('passes', function (done) {
      true.should.be.ok;
      done();
    });

    it('fails', function (done) {
      false.should.be.ok;
      done();
    });

  });

  describe('Test Suite 2', function () {
    
    it('passes', function (done) {
      true.should.be.ok;
      done();
    });

    it('fails', function (done) {
      false.should.be.ok;
      done();
    });

    xit('is pending', function (done) {
      done();
    });

    it('passes', function (done) {
      true.should.be.ok;
      done();
    });

  });
});