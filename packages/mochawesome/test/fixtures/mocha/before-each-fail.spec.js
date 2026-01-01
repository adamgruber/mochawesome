describe('outer', () => {
  describe('inner', () => {
    beforeEach(() => {
      throw new Error('beforeEach boom');
    });

    it('would have run 1', () => {});
    it('would have run 2', () => {});
  });
});
