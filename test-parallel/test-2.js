describe('Parallel Test Suite #2', () => {
  const attempts = [1, 2, 3, 4, 5];
  attempts.forEach(attempt => {
    it(`should take 1 second of time ${attempt}/${attempts.length}`, done => {
      setTimeout(done, 1000);
    });
  });
});
