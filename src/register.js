const Mocha = require('mocha');

const extendSerialize = (target, fields) => {
  const serialize = target.serialize;
  target.serialize = function (...args) {
    /* The full state is required only once during the EVENT_SUITE_BEGIN event.
      So, we have to restore the original method to minimize the transmission over IPC.
      The original method is used to provide the necessary data to mocha reporters.
      Otherwise, the serialized data will be twice as large.
      The trick here is to restore method in the instance, not in the prototype. */
    this.serialize = serialize;
    const result = serialize.call(this, ...args);
    for (let field of fields) {
      // The field's started with `$$` are results of methods
      let value = field.startsWith('$$') ? this[field.slice(2)]() : this[field];
      if (value != null) {
        if (Array.isArray(value)) {
          value = value.map(it =>
            typeof it.serialize === 'function' ? it.serialize(...args) : it
          );
        }
        result[field] = value;
      }
    }
    if (result.err instanceof Error) {
      result.err = serializeError(result.err);
    }
    return result;
  };
};

const serializeError = error => {
  /* The default properties of Error class: name, message and stack; are excluded from the enumeration.
     It causes the following: JSON.stringify(new Error("FAKE")) === '{}'
     So, we need to provide explicitly these properties to the JSON serializer. */
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...error,
    };
  }
  return error;
};

// Serialize the full root suite state to count `Skipped` tests.
extendSerialize(Mocha.Suite.prototype, [
  'file',
  'suites',
  'tests',
  '_beforeAll',
  '_beforeEach',
  '_afterEach',
  '_afterAll',
]);
extendSerialize(Mocha.Hook.prototype, [
  'body',
  'state',
  'err',
  'context',
  '$$fullTitle',
]);
extendSerialize(Mocha.Test.prototype, ['pending', 'context']);

module.exports = {};
