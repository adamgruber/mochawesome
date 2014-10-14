var fiveby = require('fiveby');

new fiveby(function (browser) {

  return describe('Fiveby Test 1', function () {

    before(function () {
      console.log("i did something before");
    });
    
    it('does nothing', function (done) {
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

    it('fails also', function (done) {
      'adam'.should.equal('someone');
      done();
    });

    after(function () {
      console.log("i did something after");
    });

  });
});