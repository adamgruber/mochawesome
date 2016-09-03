describe('Subfolder Test Suite', () => {
  describe('Test Suite - Basic', () => {
    it('passing test', done => {
      true.should.be.ok;
      done();
    });

    it('failing test', done => {
      false.should.be.ok;
      done();
    });
  });
});
