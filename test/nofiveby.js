var should = require('should');

describe('No Fiveby Test', function () {
  
  it('passes', function (done) {
    true.should.be.ok;
    done();
  });

  it('fails', function (done) {
    false.should.be.ok;
    done();
  });

});