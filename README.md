mochawesome [![npm](http://img.shields.io/badge/npm-0.2.0-green.svg?style=flat-square)](http://registry.npm.wsjfdev.dowjones.net/mochawesome)
===========

Mochawesome is a custom reporter for use with the Javascript testing framework, [mocha](http://visionmedia.github.io/mocha/). It generates a full fledged HTML/CSS report that helps visualize your test suites.

##Features
- At-a-glance stats including pass percentage
- Beautiful charts
- Support for nested `describe`s
- Supports pending tests
- Review test code inline
- Stack trace for failed tests
- Responsive
- Saves JSON output for further processing

##Sample Report

<img src="/docs/mochawesome-screen.png" alt="Mochawesome Report" width="60%" />


##Usage

1. Add Mochawesome to your project:

  `npm install --save-dev mochawesome`

2. Tell mocha to use the Mochawesome reporter:

  `mocha testfile.js --reporter mochawesome --no-exit`

  *Note the `--no-exit` option. This must be set or mocha could exit the process before the report has been fully generated*


3. If using mocha programatically:

  ```js
  var mocha = new Mocha({
      reporter: 'mochawesome'
  });
  ```