describe('outer', () => {
  describe('inner', () => {
    it('explicit skip', function () {
      this.skip();
    });

    it.skip('it.skip', () => {});

    describe.skip('describe.skip', () => {
      it('skipped by suite', () => {});
    });

    it('passes', () => {});
  });
});
