const assert = require('node:assert');

// Second file so the parallel scenario has more than one worker unit.
describe('Second File', function () {
  it('b pass', function () {
    assert.ok(true);
  });

  it('b fail', function () {
    const err = new Error('nope');
    err.name = 'AssertionError';
    throw err;
  });
});
