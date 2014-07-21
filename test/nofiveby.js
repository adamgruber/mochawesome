var should = require('should');

describe('No Fiveby Test', function () {
  
  it('passes', function (done) {
    true.should.be.ok;
    done();
  });

  it('times out', function (done) {
    setTimeout(function(done) {
      done();
    }, 2500);
  });

  it('fails', function (done) {
    false.should.be.ok;
    done();
  });

});