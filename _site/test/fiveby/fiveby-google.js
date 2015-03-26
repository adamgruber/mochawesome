var fiveby = require('fiveby');

fiveby(function (browser) {
  return describe('Google Search in ' + browser.name, function () {

    it('should work', function () {
      browser.get('http://www.google.com');
      var searchBox = browser.findElement(by.name('q'));
      searchBox.sendKeys('awesome');
      return searchBox.getAttribute('value').then(function (value) {
        'awesome'.should.equal(value);
      });
    });

    it.skip('should be skipped', function () {
      browser.get('http://www.google.com');
      var searchBox = browser.findElement(by.name('q'));
      searchBox.sendKeys('awesome');
      return searchBox.getAttribute('value').then(function (value) {
        'awesome'.should.equal(value);
      });
    });

    it('should fail finding element', function () {
      browser.get('http://www.google.com');
      var searchBox = browser.findElement(by.name('abcdef'));
      searchBox.sendKeys('awesome');
      return searchBox.getAttribute('value').then(function (value) {
        'awesome'.should.equal(value);
      });
    });
    
  });
});