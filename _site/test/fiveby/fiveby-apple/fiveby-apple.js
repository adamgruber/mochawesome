var fiveby = require('fiveby');

fiveby(function (browser) {
  return describe('Apple.com in ' + browser.name, function () {

      before(function () {
        return browser.get('http://www.apple.com');
      });

      describe('Nav Elements', function () {

        it('should have apple logo button', function () {
          var appleTab = browser.findElement({css: '.gh-tab-apple'});
          return appleTab.isDisplayed().then(function (value) {
            true.should.equal(value);
          });
        });
        
      });

      describe('Footer Elements', function () {

        it('should have copyright info', function () {
          var copyright = browser.findElement({css: '.footer-sosumi'}),
              copyrightPara = copyright.findElement({css: 'p'});
          return copyrightPara.getText().then(function (value) {
            'Copyright © 2015 Apple Inc. All rights reserved.'.should.equal(value);
          });
        });
        
      });
    
  });
});