describe('suite', function () {
  before(() => {
    console.log('before');
    // console.log(nope);
  });
  // this.retries(1);

  it('is a simple test - A1', function () {
    (1 + 1).should.equal(4);
  });

  it('is a simple test - A2', function () {
    (1 + 1).should.equal(4);
  });

  describe('nested suite', function () {
    beforeEach(() => {
      console.log('beforeEach');
    });
    it('is a simple test - nested A3', function () {
      (1 + 1).should.equal(4);
    });
  });
});
