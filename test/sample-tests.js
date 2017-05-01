/* eslint-disable no-useless-escape */

module.exports = {
  passing: {
    raw: {
      title: 'passing test',
      fullTitle: () => 'passing test',
      body: 'function () {}',
      async: 0,
      sync: true,
      _timeout: 2000,
      _slow: 75,
      _enableTimeouts: true,
      timedOut: false,
      _trace: {},
      _retries: -1,
      _currentRetry: 0,
      pending: false,
      parent: {
        title: 'Mochawesome Suite',
        ctx: {},
        suites: [],
        tests: [ '[Circular ~]' ],
        pending: false,
        _beforeEach: [],
        _beforeAll: [],
        _afterEach: [],
        _afterAll: [],
        root: false,
        _timeout: 2000,
        _enableTimeouts: true,
        _slow: 75,
        _bail: false,
        _retries: -1,
        _onlyTests: [],
        _onlySuites: [],
        delayed: false,
        parent: {
          title: '',
          suites: [ '[Circular ~.parent]' ],
          tests: [],
          pending: [],
          root: true,
          _timeout: 2000,
          uuid: 'f8d58281-fc7a-4d75-8bc7-b1c32a5cd15e',
          fullFile: '',
          file: '',
          passes: [],
          failures: [],
          skipped: [],
          hasTests: false,
          hasSuites: true,
          totalTests: 0,
          totalPasses: 0,
          totalFailures: 0,
          totalPending: 0,
          totalSkipped: 0,
          hasPasses: false,
          hasFailures: false,
          hasPending: false,
          hasSkipped: false,
          duration: 0,
          rootEmpty: true
        },
        uuid: 'a8a6bd0a-3e18-4aa3-ba36-f660e07ebed8'
      },
      ctx: {},
      uuid: '0e877e24-a28b-4869-bcb4-7c3529d84ef6',
      _events: {},
      _eventsCount: 1,
      duration: 0,
      state: 'passed',
      speed: 'fast'
    },
    cleaned: {
      title: 'passing test',
      fullTitle: 'passing test',
      timedOut: false,
      duration: 0,
      state: 'passed',
      speed: 'fast',
      pass: true,
      fail: false,
      pending: false,
      context: undefined,
      code: '',
      err: {},
      isRoot: false,
      uuid: '0e877e24-a28b-4869-bcb4-7c3529d84ef6',
      parentUUID: 'a8a6bd0a-3e18-4aa3-ba36-f660e07ebed8',
      skipped: false,
      isHook: false
    }
  },
  failing: {
    raw: {
      title: 'failing test',
      body: 'function (tDone) {\n        return tDone(new Assert(error));\n      }',
      async: 1,
      sync: false,
      _timeout: 2000,
      _slow: 75,
      _enableTimeouts: true,
      timedOut: false,
      _trace: {},
      _retries: -1,
      _currentRetry: 0,
      pending: false,
      parent: {
        title: 'Mochawesome Suite',
        ctx: {},
        suites: [],
        tests: [ '[Circular ~]' ],
        pending: false,
        _beforeEach: [],
        _beforeAll: [],
        _afterEach: [],
        _afterAll: [],
        root: false,
        _timeout: 2000,
        _enableTimeouts: true,
        _slow: 75,
        _bail: false,
        _retries: -1,
        _onlyTests: [],
        _onlySuites: [],
        delayed: false,
        parent: {
          title: '',
          suites: [ '[Circular ~.parent]' ],
          tests: [],
          pending: [],
          root: true,
          _timeout: 2000,
          uuid: '27dabdab-e16a-4e91-bb8e-1e070734a661',
          fullFile: '',
          file: '',
          passes: [],
          failures: [],
          skipped: [],
          hasTests: false,
          hasSuites: true,
          totalTests: 0,
          totalPasses: 0,
          totalFailures: 0,
          totalPending: 0,
          totalSkipped: 0,
          hasPasses: false,
          hasFailures: false,
          hasPending: false,
          hasSkipped: false,
          duration: 0,
          rootEmpty: true
        },
        uuid: '56508f44-b4e6-40f0-bae8-b15e0720f120'
      },
      ctx: {},
      uuid: '2bcbe88c-acd6-4a53-ba3a-61a59188d5b0',
      _events: {},
      _eventsCount: 1,
      timer: {
        0: null,
        _called: false,
        _idleTimeout: -1,
        _idlePrev: null,
        _idleNext: null,
        _idleStart: 2729,
        _onTimeout: null,
        _repeat: null
      },
      duration: 2,
      state: 'failed',
      err: {
        name: 'AssertionError',
        actual: '{\n  \"a\": 2\n}',
        expected: '{\n  \"a\": 1\n}',
        message: '{ a: 2 } undefined { a: 1 }',
        generatedMessage: true,
        stack: 'AssertionError: { a: 2 } undefined { a: 1 }'
      }
    },
    cleaned: {
      title: 'failing test',
      fullTitle: 'failing test',
      timedOut: false,
      duration: 2,
      state: 'failed',
      speed: undefined,
      pass: false,
      fail: true,
      pending: false,
      context: undefined,
      code: 'return tDone(new Assert(error));',
      err: {
        name: 'AssertionError',
        actual: '{\n  \"a\": 2\n}',
        expected: '{\n  \"a\": 1\n}',
        message: '{ a: 2 } undefined { a: 1 }',
        generatedMessage: true,
        estack: 'AssertionError: { a: 2 } undefined { a: 1 }',
        diff: ' {\n-   \"a\": 2\n+   \"a\": 1\n }\n'
      },
      isRoot: false,
      uuid: '2bcbe88c-acd6-4a53-ba3a-61a59188d5b0',
      parentUUID: '56508f44-b4e6-40f0-bae8-b15e0720f120',
      skipped: false,
      isHook: false
    }
  },
  pending: {
    raw: {
      title: 'pending test',
      body: '',
      sync: true,
      _timeout: 2000,
      _slow: 75,
      _enableTimeouts: true,
      timedOut: false,
      _trace: {},
      _retries: -1,
      _currentRetry: 0,
      pending: true,
      parent: {
        title: 'Mochawesome Suite',
        ctx: {},
        suites: [],
        tests: [ '[Circular ~]' ],
        pending: false,
        _beforeEach: [],
        _beforeAll: [],
        _afterEach: [],
        _afterAll: [],
        root: false,
        _timeout: 2000,
        _enableTimeouts: true,
        _slow: 75,
        _bail: false,
        _retries: -1,
        _onlyTests: [],
        _onlySuites: [],
        delayed: false,
        parent: {
          title: '',
          suites: [ '[Circular ~.parent]' ],
          tests: [],
          pending: [],
          root: true,
          _timeout: 2000,
          uuid: '875747c6-96e7-44a7-a4ad-921bddd1746d',
          fullFile: '',
          file: '',
          passes: [],
          failures: [],
          skipped: [],
          hasTests: false,
          hasSuites: true,
          totalTests: 0,
          totalPasses: 0,
          totalFailures: 0,
          totalPending: 0,
          totalSkipped: 0,
          hasPasses: false,
          hasFailures: false,
          hasPending: false,
          hasSkipped: false,
          duration: 0,
          rootEmpty: true
        },
        uuid: '88d24c3c-9262-4f6f-9419-a9fe259e3c95'
      },
      ctx: {},
      uuid: '6e8e6fe4-b2a1-4cdf-8f94-099f98b5b472'
    },
    cleaned: {
      title: 'pending test',
      fullTitle: 'pending test',
      timedOut: false,
      duration: 0,
      state: undefined,
      speed: undefined,
      pass: false,
      fail: false,
      pending: true,
      context: undefined,
      code: '',
      err: {},
      isRoot: false,
      uuid: '6e8e6fe4-b2a1-4cdf-8f94-099f98b5b472',
      parentUUID: '88d24c3c-9262-4f6f-9419-a9fe259e3c95',
      skipped: false,
      isHook: false
    }
  }
};
