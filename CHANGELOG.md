# mochawesome changelog

## [Unreleased]

## [7.0.0] - 2021-11-03
### Changed
- **BREAKING** Update `mochawesome-report-generator` to 6.0.0 (Drops support for Node<12)
- Update `strip-ansi` dependency to latest non-ESM version
- Update `chalk` dependency

## [6.3.1] - 2021-10-06
### Fixed
- Ignore `retriedTest` serialization to avoid circular issues [#356](https://github.com/adamgruber/mochawesome/issues/356)

## [6.3.0] - 2021-09-29
### Changed
- Update parallel processing so output JSON matches sync runs [#353](https://github.com/adamgruber/mochawesome/pull/353)
- Update how the total number of skipped tests is calculated [#317](https://github.com/adamgruber/mochawesome/issues/317)

## [6.2.2] - 2021-02-16
### Changed
- Greenkeep dependencies

## [6.2.1] - 2020-11-02
### Fixed
- Add `register.js` to "files" array

## [6.2.0] - 2020-11-01
### Added
- Support mocha `--parallel` mode

### Changed
- Update dev dependencies
- Remove airbnb-extended `eslint` config. Use `eslint:recommended` instead
- Add `husky`, `lint-staged`, and `prettier`
- Format all files with `prettier`
- Remove travis-ci config

## [6.1.1] - 2020-04-27
### Fixed
- Restore inline-diff rendering [#312](https://github.com/adamgruber/mochawesome/issues/312)

## [6.1.0] - 2020-04-13
### Changed
- Bump mochawesome-report-generator to 5.1.0. No longer requires react or react-dom as peer deps

## [6.0.0] - 2020-04-10
### Changed
- **BREAKING** Bump mochawesome-report-generator to 5.0.0 (Requires `react` and `react-dom` be installed separately)
- Update all other dependencies

## [5.0.0] - 2020-02-25
### Changed
- **BREAKING** Drop support for node 8
- **BREAKING** Requies mocha 7+

### Fixed
- Ensure a stats collector is always initialized
- Omit code snippets from JSON when `code` option is `false`

## [4.1.0] - 2019-08-06
### Added
- New `consoleReporter` option to allow specifying console reporter to use or disabling console reporter entirely [#99](https://github.com/adamgruber/mochawesome/issues/99)

## [4.0.1] - 2019-06-15
### Fixed
- Issue where using `addContext` inside a `before` or `after` hook would incorrectly apply context to the test [#284](https://github.com/adamgruber/mochawesome/issues/284)

## [4.0.0] - 2019-06-04
- **Breaking changes to JSON data structure:**
- Renamed `allSuites` to `results` and made it an array of suites
- Removed `isRoot` property from cleaned tests (only suites can be a root)
- Removed class-related stats (`passPercentClass`, `pendingPercentClass`)
- Added `uuid` to suites
- Removed rounding of `passPercent` and `pendingPercent`
- Removed `copyrightYear` property
- Added new `meta` property to track info about the test run (useful for debugging)

### Changed
- Drop support for Node <8
- Require peer dependency of mocha >5
- Removed Babel dependency
- Replace lodash dependency with individual modules
- Updated codeclimate config to version 2
- Updated various dependencies

## [3.1.2] - 2019-04-17
### Fixed
- Issue where a suite with skipped tests reports duration as `0`. [#276](https://github.com/adamgruber/mochawesome/issues/276)

## [3.1.1] - 2018-10-22
### Changed
- Switch from RegExp to state machine for stripping function start in `cleanCode` method. [#257](https://github.com/adamgruber/mochawesome/issues/257)

## [3.1.0] - 2018-10-17
### Changed
- Invert logic for getting test code by checking for `test.body` before `test.fn` inside `cleanTest` method [#252](https://github.com/adamgruber/mochawesome/issues/252)

## [3.0.3] - 2018-07-25
### Changed
- Reworked `cleanCode` regexes to handle more cases [#244](https://github.com/adamgruber/mochawesome/issues/244)

## [3.0.2] - 2018-01-25
### Changed
- Call `stripAnsi` for test/suite titles. [#223](https://github.com/adamgruber/mochawesome/pull/223) (@JoeTheFkingFrypan)

## [3.0.1] - 2017-12-26
### Fixed
- Updated RegExp in `cleanCode` method to handle arrow functions without braces. [#220](https://github.com/adamgruber/mochawesome/issues/220)

## [3.0.0] - 2017-11-30
This release is in tandem with and requires mochawesome-report-generator >= 3.0.0.
### Added
- New option: `html`. Allows user to specify whether or not to generate the HTML report. Defaults to `true`.

### Changed
- **BREAKING:** This release features a trimmed-down data output that removes properties that are not necessary for the report generation. This change will only affect things that consume the JSON output and does not affect usage of the reporter itself.
- Suites are now cleaned by mapping over them instead of a breadth-first traversal
- Options handling was overhauled and greatly simplified. The reporter will only concern itself with options directly related to the reporter. All other options are passed through to the report generator as-is.
- Updated the `done` function to display better output when only one or no files have been generated.

### Removed
- `enableTestCode` option was deprecated as of 2.0.3 and has been removed. Use `enableCode` instead.

## [2.3.1]
### Fixed
- Fixes an issue where generator functions were not displayed properly [#188](https://github.com/adamgruber/mochawesome/pull/188) (@APshenkin)

## [2.3.0]
### Added
- Added `showHooks` option [#168](https://github.com/adamgruber/mochawesome/pull/168)
- Support mocha's `--inline-diffs` option [#167](https://github.com/adamgruber/mochawesome/pull/167)
- Normalize error objects for consistent display [#166](https://github.com/adamgruber/mochawesome/pull/166)
- Bumped mochawesome-report-generator dependency to 2.2.0

## [2.2.1]
### Changed
- Separated out before and after hooks
- Bumped mochawesome-report-generator dependency to 2.1.0

## [2.2.0]
### Changed
- Enable using `addContext` in `beforeEach` and `afterEach` test hooks
- Fix a bug where you could pass an object with empty title string to `addContext`
- Allow a context value of `undefined` to be displayed in the report

## [2.1.0]
### Added
- Added new options: `overwrite` and `timestamp`

## [2.0.5]
### Fixed
- Fix `UnhandledPromiseRejectionWarning` error when calling nonexistant `exit` function
- Limit files included in package

## [2.0.4]
### Changed
- Better handling of different coding styles in test code. [#98](https://github.com/adamgruber/mochawesome/issues/98)
- Separate utility functions from main reporter code for better test coverage
- Bump `mochawesome-report-generator` and `fs-extra` packages

## [2.0.3]
### Added
- Add `enableCode` option to be consistent with mochawesome-report-generator options
- Add `dev` option for testing

### Changed
- Deprecate `enableTestCode` option

### Fixed
- Fixed [#126](https://github.com/adamgruber/mochawesome/issues/126)
- Fix default options handling

## [2.0.2]
### Fixed
- Fixed [#111](https://github.com/adamgruber/mochawesome/issues/111)

## [2.0.1]
### Fixed
- Fixed an issue where `reportFilename` was not propagated to `config` object
- Updated handling of `reportDir` option to allow relative paths
- Bumped mochawesome-report-generator dependency (requires 1.0.3 or higher)

## [2.0.0]
### Changed
- Moved report generation to mochawesome-report package
- Updated dependencies
- Switched from jshint to eslint
- Rewritten using ES6
- Fixed an issue where test uuid was not generated properly
- Added `done` function that will get called before mocha exits (eliminates need for `--no-exit` option)
- Unit tests!
- Added diff for test error
- Added ability to display additional test context
- **Breaking** `reportName` option changed to `reportFilename`

## [1.5.4]
### Changed
- Run pending tests thru `cleanTest` function. Fixes possible scenario where a pending test with a large amount of text could cause node to run out of memory. See [#94](https://github.com/adamgruber/mochawesome/issues/94)

## [1.5.3]
### Fixed
- Fixed build issues on Windows. See [#84](https://github.com/adamgruber/mochawesome/pull/84)

## [1.5.2]
### Changed
- Updated mocha peerDependency to allow any version

## [1.5.1]
### Added
- Added missing LICENSE.md file

## [1.5.0]
### Changed
- Moved mocha to peerDependencies and devDependencies and fixed it to `~2`. See [#69](https://github.com/adamgruber/mochawesome/issues/69)

## [1.4.0]
### Added
- Added slide-over navigation menu for quickly jumping to a test suite. See [#49](https://github.com/adamgruber/mochawesome/issues/49)

## [1.3.5]
### Fixed
- Removed extra slash in `@font-path` LESS variable. See [#53](https://github.com/adamgruber/mochawesome/issues/53)

## [1.3.4]
### Added
- Added option to auto open report. Also fixed an issue with boolean options. See [#44](https://github.com/adamgruber/mochawesome/issues/44)

## [1.3.3]
### Added
- Added support for creating custom dir where the parent dir(s) may not exist yet. See [#40](https://github.com/adamgruber/mochawesome/issues/40)

## [1.3.2]
### Fixed
- Removed `allHooks` array since it was not being used and could lead to an issue where node runs out of memory while rendering the template. See [#33](https://github.com/adamgruber/mochawesome/issues/33)

## [1.3.1]
### Changed
- Update copyright in template

## [1.3.0]
### Fixed
- Changes to support mocha 2.4.0 and later (fixes empty code blocks). See [#29](https://github.com/adamgruber/mochawesome/issues/29)

## [1.2.2]
### Added
- Added option to generate report with all assets inlined. See [#26](https://github.com/adamgruber/mochawesome/issues/26)

## [1.2.1]
### Fixed
- Reset `totalTestsRegistered` when reporter is run. [PR #21](https://github.com/adamgruber/mochawesome/pull/21)

## [1.2.0]
### Added
- Enhancement: custom report title option. Closes [#11](https://github.com/adamgruber/mochawesome/issues/11)

### Fixed
- Fixed indentation in code block and stack traces

## [1.1.2]
### Fixed
- Fixes [#10](https://github.com/adamgruber/mochawesome/issues/10)

## [1.1.1]
### Added
- Add filter icon in summary for better visibility (Completely new idea and not at all in response to [this](https://github.com/adamgruber/mochawesome/issues/5))

### Changed
- Change util.print to console.log due to [deprecation](https://github.com/joyent/node/blob/master/doc/api/util.markdown#user-content-utilprint)

## [1.1.0]
### Added
- Add support for options
- custom report directory
- custom report filename
- Enhancements to console output

## [1.0.5]
### Changed
- Bugfixes

## 1.0.0
### Added
- Redesigned report
- Mobile friendly
- Complete refactor of client-side script
- Custom builds of vendor scripts
- Custom font-icon set
- All fonts are now local to the report

[Unreleased]: https://github.com/adamgruber/mochawesome/compare/7.0.0...HEAD
[7.0.0]: https://github.com/adamgruber/mochawesome/compare/6.3.1...7.0.0
[6.3.1]: https://github.com/adamgruber/mochawesome/compare/6.3.0...6.3.1
[6.3.0]: https://github.com/adamgruber/mochawesome/compare/6.2.2...6.3.0
[6.2.2]: https://github.com/adamgruber/mochawesome/compare/6.2.1...6.2.2
[6.2.1]: https://github.com/adamgruber/mochawesome/compare/6.2.0...6.2.1
[6.2.0]: https://github.com/adamgruber/mochawesome/compare/6.1.1...6.2.0
[6.1.1]: https://github.com/adamgruber/mochawesome/compare/6.1.0...6.1.1
[6.1.0]: https://github.com/adamgruber/mochawesome/compare/6.0.0...6.1.0
[6.0.0]: https://github.com/adamgruber/mochawesome/compare/5.0.0...6.0.0
[5.0.0]: https://github.com/adamgruber/mochawesome/compare/4.1.0...5.0.0
[4.1.0]: https://github.com/adamgruber/mochawesome/compare/4.0.1...4.1.0
[4.0.1]: https://github.com/adamgruber/mochawesome/compare/4.0.0...4.0.1
[4.0.0]: https://github.com/adamgruber/mochawesome/compare/3.1.2...4.0.0
[3.1.2]: https://github.com/adamgruber/mochawesome/compare/3.1.1...3.1.2
[3.1.1]: https://github.com/adamgruber/mochawesome/compare/3.1.0...3.1.1
[3.1.0]: https://github.com/adamgruber/mochawesome/compare/3.0.3...3.1.0
[3.0.3]: https://github.com/adamgruber/mochawesome/compare/3.0.2...3.0.3
[3.0.2]: https://github.com/adamgruber/mochawesome/compare/3.0.1...3.0.2
[3.0.1]: https://github.com/adamgruber/mochawesome/compare/3.0.0...3.0.1
[3.0.0]: https://github.com/adamgruber/mochawesome/compare/2.3.1...3.0.0
[2.3.1]: https://github.com/adamgruber/mochawesome/compare/2.3.0...2.3.1
[2.3.0]: https://github.com/adamgruber/mochawesome/compare/2.2.1...2.3.0
[2.2.1]: https://github.com/adamgruber/mochawesome/compare/2.2.0...2.2.1
[2.2.0]: https://github.com/adamgruber/mochawesome/compare/2.1.0...2.2.0
[2.1.0]: https://github.com/adamgruber/mochawesome/compare/2.0.5...2.1.0
[2.0.5]: https://github.com/adamgruber/mochawesome/compare/2.0.4...2.0.5
[2.0.4]: https://github.com/adamgruber/mochawesome/compare/2.0.3...2.0.4
[2.0.3]: https://github.com/adamgruber/mochawesome/compare/2.0.2...2.0.3
[2.0.2]: https://github.com/adamgruber/mochawesome/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/adamgruber/mochawesome/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/adamgruber/mochawesome/compare/1.5.4...2.0.0
[1.5.4]: https://github.com/adamgruber/mochawesome/compare/1.5.3...1.5.4
[1.5.3]: https://github.com/adamgruber/mochawesome/compare/1.5.2...1.5.3
[1.5.2]: https://github.com/adamgruber/mochawesome/compare/1.5.1...1.5.2
[1.5.1]: https://github.com/adamgruber/mochawesome/compare/1.5.0...1.5.1
[1.5.0]: https://github.com/adamgruber/mochawesome/compare/1.4.0...1.5.0
[1.4.0]: https://github.com/adamgruber/mochawesome/compare/1.3.5...1.4.0
[1.3.5]: https://github.com/adamgruber/mochawesome/compare/1.3.4...1.3.5
[1.3.4]: https://github.com/adamgruber/mochawesome/compare/1.3.3...1.3.4
[1.3.3]: https://github.com/adamgruber/mochawesome/compare/1.3.2...1.3.3
[1.3.2]: https://github.com/adamgruber/mochawesome/compare/1.3.1...1.3.2
[1.3.1]: https://github.com/adamgruber/mochawesome/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/adamgruber/mochawesome/compare/1.2.2...1.3.0
[1.2.2]: https://github.com/adamgruber/mochawesome/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/adamgruber/mochawesome/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/adamgruber/mochawesome/compare/1.1.2...1.2.0
[1.1.2]: https://github.com/adamgruber/mochawesome/compare/1.1.1...1.1.2
[1.1.1]: https://github.com/adamgruber/mochawesome/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/adamgruber/mochawesome/compare/1.0.5...1.1.0
[1.0.5]: https://github.com/adamgruber/mochawesome/compare/1.0.0...1.0.5
