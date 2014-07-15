var fiveby = require('fiveby');

new fiveby(function (browser) {

  return describe('Dummy Test 4', function () {
    
    it('does nothing', function (done) {
      true.should.be.ok;
      done();
    });

    it('fails', function (done) {
      false.should.be.ok;
      done();
    });

    it('fails also', function (done) {
      'adam'.should.equal('someone');
      done();
    });

  });
});