it('should pass', () => {
  (1 + 1).should.equal(2);
});

it('shall not pass', () => {
  (1 + 12).should.equal(2);
});
