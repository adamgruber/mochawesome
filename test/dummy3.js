var fiveby = require('fiveby');

new fiveby(function (browser) {

  return describe('Dummy Test 3', function () {

    describe("i'm nested!", function() {
      it('does something', function (done) {
        true.should.be.ok;
        done();
      });
    })    

    it('fails 3', function (done) {
      false.should.be.ok;
      done();
    });

  });
});