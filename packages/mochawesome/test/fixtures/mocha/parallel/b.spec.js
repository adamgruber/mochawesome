describe('outer', () => {
  describe('inner', () => {
    before(() => {
      // Do something
    });

    beforeEach(() => {
      // Do something each test
    });

    it('b: passes', () => {});
    it('b: fails', () => {
      throw new Error('boom');
    });
    it('b: pending');
  });
});
