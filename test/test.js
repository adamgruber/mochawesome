var should = require('should');

describe('Master Test Suite', function () {

  describe('Mocha Test', function () {
    
    it('passes', function (done) {
      true.should.be.ok;
      done();
    });

    it('fails', function (done) {
      false.should.be.ok;
      done();
    });

  });

  describe('Mocha Test 2', function () {
    
    it('passes', function (done) {
      true.should.be.ok;
      done();
    });

    it('fails', function (done) {
      false.should.be.ok;
      done();
    });

  });
});