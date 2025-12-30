describe('outer', () => {
  describe('inner', () => {
    it('times out', async function () {
      this.timeout(10);
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  });
});
