describe('outer', () => {
  describe('inner', () => {
    before(() => {
      throw new Error('hook boom');
    });

    it('passes', () => {});
    it('fails', () => {
      throw new Error('boom');
    });
    it('pending');
  });
});
