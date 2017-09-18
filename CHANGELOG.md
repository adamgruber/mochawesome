# Changelog

### [2.3.1](https://github.com/adamgruber/mochawesome/releases/tag/2.3.1)
- Fixes an issue where generator functions were not displayed properly [#188](https://github.com/adamgruber/mochawesome/pull/188) (@APshenkin)

### [2.3.0](https://github.com/adamgruber/mochawesome/releases/tag/2.3.0)
- Added `showHooks` option [#168](https://github.com/adamgruber/mochawesome/pull/168)
- Support mocha's `--inline-diffs` option [#167](https://github.com/adamgruber/mochawesome/pull/167)
- Normalize error objects for consistent display [#166](https://github.com/adamgruber/mochawesome/pull/166)
- Bumped mochawesome-report-generator dependency to 2.2.0

### [2.2.1](https://github.com/adamgruber/mochawesome/releases/tag/2.2.1)
- Separated out before and after hooks
- Bumped mochawesome-report-generator dependency to 2.1.0

### [2.2.0](https://github.com/adamgruber/mochawesome/releases/tag/2.2.0)
- Enable using `addContext` in `beforeEach` and `afterEach` test hooks
- Fix a bug where you could pass an object with empty title string to `addContext`
- Allow a context value of `undefined` to be displayed in the report

### [2.1.0](https://github.com/adamgruber/mochawesome/releases/tag/2.1.0)
- Added new options: `overwrite` and `timestamp`

### [2.0.5](https://github.com/adamgruber/mochawesome/releases/tag/2.0.5)
- Fix `UnhandledPromiseRejectionWarning` error when calling nonexistant `exit` function
- Limit files included in package

### [2.0.4](https://github.com/adamgruber/mochawesome/releases/tag/2.0.4)
- Better handling of different coding styles in test code. [#98](https://github.com/adamgruber/mochawesome/issues/98)
- Separate utility functions from main reporter code for better test coverage
- Bump `mochawesome-report-generator` and `fs-extra` packages

### [2.0.3](https://github.com/adamgruber/mochawesome/releases/tag/2.0.3)
- Fixed [#126](https://github.com/adamgruber/mochawesome/issues/126)
- Fix default options handling
- Add `enableCode` option to be consistent with mochawesome-report-generator options
- Deprecate `enableTestCode` option
- Add `dev` option for testing

### [2.0.2](https://github.com/adamgruber/mochawesome/releases/tag/2.0.2)
- Fixed [#111](https://github.com/adamgruber/mochawesome/issues/111)

### [2.0.1](https://github.com/adamgruber/mochawesome/releases/tag/2.0.1)
- Fixed an issue where `reportFilename` was not propagated to `config` object
- Updated handling of `reportDir` option to allow relative paths
- Bumped mochawesome-report-generator dependency (requires 1.0.3 or higher)

## [2.0.0](https://github.com/adamgruber/mochawesome/releases/tag/2.0.0)
- Moved report generation to mochawesome-report package
- Updated dependencies
- Switched from jshint to eslint
- Rewritten using ES6
- Fixed an issue where test uuid was not generated properly
- Added `done` function that will get called before mocha exits (eliminates need for `--no-exit` option)
- Unit tests!
- Added diff for test error
- Added ability to display additional test context

**Breaking Changes**
- `reportName` option changed to `reportFilename`

### [1.5.4](https://github.com/adamgruber/mochawesome/releases/tag/1.5.4)
- Run pending tests thru `cleanTest` function. Fixes possible scenario where a pending test with a large amount of text could cause node to run out of memory. See [#94](https://github.com/adamgruber/mochawesome/issues/94)

### [1.5.3](https://github.com/adamgruber/mochawesome/releases/tag/1.5.3)
- Fixed build issues on Windows. See [#84](https://github.com/adamgruber/mochawesome/pull/84)

### [1.5.2](https://github.com/adamgruber/mochawesome/releases/tag/1.5.2)
- Updated mocha peerDependency to allow any version

### [1.5.1](https://github.com/adamgruber/mochawesome/releases/tag/1.5.1)
- Added missing LICENSE.md file

### [1.5.0](https://github.com/adamgruber/mochawesome/releases/tag/1.5.0)
- Moved mocha to peerDependencies and devDependencies and fixed it to `~2`. See [#69](https://github.com/adamgruber/mochawesome/issues/69)

### [1.4.0](https://github.com/adamgruber/mochawesome/releases/tag/1.4.0)
- Added slide-over navigation menu for quickly jumping to a test suite. See [#49](https://github.com/adamgruber/mochawesome/issues/49)

### [1.3.5](https://github.com/adamgruber/mochawesome/releases/tag/1.3.5)
- Removed extra slash in `@font-path` LESS variable. See [#53](https://github.com/adamgruber/mochawesome/issues/53)

### [1.3.4](https://github.com/adamgruber/mochawesome/releases/tag/1.3.4)
- Added option to auto open report. Also fixed an issue with boolean options. See [#44](https://github.com/adamgruber/mochawesome/issues/44)

### [1.3.3](https://github.com/adamgruber/mochawesome/releases/tag/1.3.3)
- Added support for creating custom dir where the parent dir(s) may not exist yet. See [#40](https://github.com/adamgruber/mochawesome/issues/40)

### [1.3.2](https://github.com/adamgruber/mochawesome/releases/tag/1.3.2)
- Removed `allHooks` array since it was not being used and could lead to an issue where node runs out of memory while rendering the template. See [#33](https://github.com/adamgruber/mochawesome/issues/33)

### [1.3.1](https://github.com/adamgruber/mochawesome/releases/tag/1.3.1)
- Update copyright in template

### [1.3.0](https://github.com/adamgruber/mochawesome/releases/tag/1.3.0)
- Changes to support mocha 2.4.0 and later (fixes empty code blocks). See [#29](https://github.com/adamgruber/mochawesome/issues/29)

### [1.2.2](https://github.com/adamgruber/mochawesome/releases/tag/1.2.2)
- Added option to generate report with all assets inlined. See [#26](https://github.com/adamgruber/mochawesome/issues/26)

### [1.2.1](https://github.com/adamgruber/mochawesome/releases/tag/1.2.1)
- Reset `totalTestsRegistered` when reporter is run. [PR #21](https://github.com/adamgruber/mochawesome/pull/21)

### [1.2.0](https://github.com/adamgruber/mochawesome/releases/tag/1.2.0)
- Enhancement: custom report title option. Closes [#11](https://github.com/adamgruber/mochawesome/issues/11)
- Fixed indentation in code block and stack traces

### [1.1.2](https://github.com/adamgruber/mochawesome/releases/tag/1.1.2)
- Fixes [#10](https://github.com/adamgruber/mochawesome/issues/10)

### [1.1.1](https://github.com/adamgruber/mochawesome/releases/tag/1.1.0)
- Add filter icon in summary for better visibility (Completely new idea and not at all in response to [this](https://github.com/adamgruber/mochawesome/issues/5))
- Change util.print to console.log due to [deprecation](https://github.com/joyent/node/blob/master/doc/api/util.markdown#user-content-utilprint)

### [1.1.0](https://github.com/adamgruber/mochawesome/releases/tag/1.1.0)
- Add support for options
  - custom report directory
  - custom report filename
- Enhancements to console output

### 1.0.1 - 1.0.5
- Bugfixes

## [1.0.0](https://github.com/adamgruber/mochawesome/releases/tag/1.0.0)
- Redesigned report
- Mobile friendly
- Complete refactor of client-side script
- Custom builds of vendor scripts
- Custom font-icon set
- All fonts are now local to the report
