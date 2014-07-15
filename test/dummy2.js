var fiveby = require('fiveby');

new fiveby(function (browser) {

  return describe('Dummy Test 2', function () {

    before(function () {
      console.log("i did something before");
    });
    
    it('does something', function (done) {
      true.should.be.ok;
      done();
    });

    it('passes', function (done) {
      true.should.be.ok;
      done();
    });

    it('fails also 2', function (done) {
      'adam'.should.equal('someone');
      done();
    });

    after(function () {
      console.log("i did something after");
    });

  });
});