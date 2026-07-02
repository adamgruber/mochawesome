const assert = require('node:assert');
// Resolve addContext whether we run inside this repo (golden gate) or from a
// temp project that installed the package (published comparison).
let addContext;
try {
  addContext = require('mochawesome/addContext');
} catch {
  addContext = require('../../addContext');
}

// Deterministic fixture suite used by the report-output parity gate.
// Covers passing, failing-with-diff, pending, nested suites, hooks and
// addContext (string + object). Keep this stable: changing it will change
// the golden snapshots in test-parity/golden.
describe('Parity Suite', function () {
  beforeEach(function () {
    addContext(this, 'beforeEach context');
  });

  it('passes with context', function () {
    addContext(this, 'a simple string');
    addContext(this, { title: 'an object', value: { a: 1, b: '2' } });
    assert.strictEqual(1 + 1, 2);
  });

  it('fails with a diff', function () {
    // Build the error by hand so the message/diff do not depend on the
    // Node version's assertion-message formatting.
    const err = new Error('values are not equal');
    err.name = 'AssertionError';
    err.actual = { a: 2 };
    err.expected = { a: 1 };
    err.showDiff = true;
    throw err;
  });

  it('is pending');

  describe('Nested Suite', function () {
    it('nested pass', function () {
      assert.strictEqual(typeof 'x', 'string');
    });
  });
});
