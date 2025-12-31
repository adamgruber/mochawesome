'use strict';

// Mocha parallel mode serializes suites/tests from worker processes to the main process.
// Ensure declared-pending tests (it('name') with no fn) are included in the serialized suite tree.

(() => {
  let mocha;
  try {
    mocha = require('mocha');
  } catch (e) {
    return;
  }

  const Suite = mocha && mocha.Suite;
  if (!Suite) return;

  const FLAG = '__mochawesomeSerializePatched__';
  if (Suite.prototype[FLAG]) return;
  Object.defineProperty(Suite.prototype, FLAG, { value: true });

  const origSerialize = Suite.prototype.serialize;
  if (typeof origSerialize !== 'function') return;

  Suite.prototype.serialize = function mochawesomeSerialize() {
    const obj = origSerialize.call(this);

    // Force `tests` to reflect the live suite tests list, including declared pending.
    obj.tests = (this.tests || []).map(t => {
      if (t && typeof t.serialize === 'function') return t.serialize();
      const fullTitle =
        t && typeof t.fullTitle === 'function' ? t.fullTitle() : t.title;
      return {
        title: t.title,
        fullTitle,
        file: t.file,
        pending: !!t.pending,
      };
    });

    return obj;
  };
})();
