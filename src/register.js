const Mocha = require('mocha');

const extendSerialize = (target, fields) => {
  const serialize = target.serialize;
  target.serialize = function (...args) {
    const result = serialize.call(this, ...args);
    for (let field of fields) {
      result[field] = this[field];
    }
    return result;
  };
};

extendSerialize(Mocha.Suite.prototype, ['file']);
extendSerialize(Mocha.Hook.prototype, ['body', 'state']);
extendSerialize(Mocha.Test.prototype, ['pending', 'context']);

module.exports = {};
