describe('outer', () => {
  describe('inner', () => {
    after(() => {
      throw new Error('afterAll boom');
    });

    it('passes', () => {});
    it('passes too', () => {});
  });
});
