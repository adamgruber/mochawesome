describe('outer', () => {
  describe('inner', () => {
    let n = 0;

    it('flaky', function () {
      this.retries(2);
      n += 1;
      if (n < 2) throw new Error('first fail');
    });
  });
});
