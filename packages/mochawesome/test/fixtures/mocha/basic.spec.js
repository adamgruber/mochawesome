describe('outer', () => {
  describe('inner', () => {
    it('passes', () => {});
    it('fails', () => {
      throw new Error('boom');
    });
    it('pending');
  });
});
