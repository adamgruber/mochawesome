mochawesome
===========
[![npm](https://img.shields.io/npm/v/mochawesome.svg?style=flat-square)](http://www.npmjs.com/package/mochawesome) [![Build Status](https://img.shields.io/travis/adamgruber/mochawesome/master.svg?style=flat-square)](https://travis-ci.org/adamgruber/mochawesome) [![Code Climate](https://img.shields.io/codeclimate/github/adamgruber/mochawesome.svg?style=flat-square)](https://codeclimate.com/github/adamgruber/mochawesome)

Mochawesome is a custom reporter for use with the Javascript testing framework, [mocha](http://visionmedia.github.io/mocha/). It generates a full fledged HTML/CSS report that helps visualize your test suites.

##Changes as of 1.0.0
- Redesigned report
- Mobile friendly
- Complete refactor of client-side script
- Custom builds of vendor scripts
- Custom font-icon set
- All fonts are now local to the report

##Features
- At-a-glance stats including pass percentage
- Beautiful charts
- Support for nested `describe`s
- Supports pending tests
- Filter view by test type
- Review test code inline
- Stack trace for failed tests
- Responsive
- Saves JSON output for further processing
- Offline viewing

##Browser Support
Tested to work in Chrome. *Should* work in any modern web browser including IE9+.
Mochawesome generates a self-contained report that can be viewed offline. 

##Sample Report

<img src="./docs/mochawesome-screen.png" alt="Mochawesome Report" width="60%" />


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

##Development
If you wish to make changes to the reporter you will need to clone the repo and build locally. Building requires you to have [gulp](https://github.com/gulpjs/gulp) installed.

###Installation
```sh
$ git clone https://github.dowjones.net/grubera/mochawesome
```
###Modifying
Reporter files are found in `/lib` directory.
Templates, styles, and client-side scripts are in the `/src` directory.

###Building
There are several gulp tasks available but the main ones to be aware of are:

####`gulp build` - Full Build
Runs jshint, parses LESS, compiles templates, concatenates and minifies scripts.
*Note: This task will fail if linting fails.*

####`gulp watch` - Watch Files
Watches for changes to JS, LESS, and MU and builds when a change is detected. If a change is detected in a JS file this will run jshint first before building and will fail on any lint errors.

####`gulp lint` - Lint JS
This will run jshint only, no building will occur.

####`gulp test` - Run Test
After building you can run this to test the reporter and see the output.
*Note: The default gulp task will run this task.*