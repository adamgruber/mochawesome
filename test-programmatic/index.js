const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
require('should');

// Instantiate a Mocha instance.
const mocha = new Mocha({
  reporter: path.resolve(__dirname, '../src/mochawesome'),
  reporterOptions: {
    reportFilename: 'adam',
    timestamp: 'dd yyyy'
  }
});

const testDir = path.resolve(__dirname, '../test-functional');

// Add each .js file to the mocha instance
fs.readdirSync(testDir)
  // .filter(file => file.substr(-3) === '.js')
  .filter(file => file === 'test.js')
  .forEach(file => mocha.addFile(path.join(testDir, file)));

// Run the tests.
mocha.run(failures => {
  process.on('exit', () => {
    process.exit(failures); // exit with non-zero status if there were failures
  });
});
