describe('outer', () => {
  describe('inner', () => {
    it('fails first', () => {
      throw new Error('boom');
    });

    it('would have run', () => {});
  });
});
