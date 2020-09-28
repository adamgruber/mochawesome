const addContext = require('../src/addContext');

describe('<Navigation>', () => {
  it('passes the smoke test', () => {
    (1 + 1).should.equal(2);
  });

  describe('renders', () => {
    it('should have text context', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'this is the test context');
      done();
    });
    it('should have url context, no protocol', function (done) {
      (1 + 1).should.equal(2);
      addContext(this, 'www.apple.com');
      done();
    });
  });

  describe('when screen is mobile', () => {
    it('should have some properties', () => {
      (1 + 1).should.equal(2);
    });

    describe('and is also android', () => {
      it('should have some other properties', () => {
        (1 + 1).should.equal(2);
      });
    });
  });
});
