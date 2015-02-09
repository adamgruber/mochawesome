var fiveby = require('fiveby');

fiveby(function (browser) {
  return describe('Bing Search in ' + browser.name, function () {

    it('should work', function () {
      browser.get('http://www.bing.com');
      var searchBox = browser.findElement(by.name('q'));
      searchBox.sendKeys('awesome');
      return searchBox.getAttribute('value').then(function (value) {
        'awesome'.should.equal(value);
      });
    });
    
  });
});