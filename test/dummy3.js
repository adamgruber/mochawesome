var fiveby = require('fiveby');

new fiveby(function (browser) {

  return describe('Dummy Test 3', function () {

    describe("i'm nested!", function() {

      describe("i'm nested 2!", function() {
        it('does something while nested 2', function (done) {
          true.should.be.ok;
          done();
        });
      })    


      it('does something while nested', function (done) {
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