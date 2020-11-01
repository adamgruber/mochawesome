/**
 * Re-export `register` from ./src folder in order to register nicely mochawesome as a hook in mocha
 * in the way how it's done in ts-node/register or @babel/register
 * @example
 * $ mocha --require mochawesome/register tests
 *
 */
module.exports = require('./src/register');
