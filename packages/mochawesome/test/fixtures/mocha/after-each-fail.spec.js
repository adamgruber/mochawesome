describe('outer', () => {
  describe('inner', () => {
    afterEach(() => {
      throw new Error('afterEach boom');
    });

    it('passes', () => {});
    it('passes too', () => {});
  });
});
