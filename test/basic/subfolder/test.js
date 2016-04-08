var should = require('should');

describe('Subfolder Test Suite', function () {
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
});