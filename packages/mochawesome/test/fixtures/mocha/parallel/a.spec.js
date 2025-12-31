describe('outer', () => {
  describe('inner', () => {
    before(() => {
      // Do something
    });

    beforeEach(() => {
      // Do something each test
    });

    it('a: passes', () => {});
    it('a: fails', () => {
      throw new Error('boom');
    });
    it('a: pending');
  });
});
