describe('outer', () => {
  describe('inner-pass', () => {
    it('passes', () => {});
  });

  describe('inner-hook-fail', () => {
    before(() => {
      throw new Error('hook boom');
    });

    it('would have run', () => {});
    it('would also have run', () => {});
  });
});
