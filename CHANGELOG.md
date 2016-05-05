#Changelog

###1.3.4
- Added option to auto open report. Also fixed an issue with boolean options. See [#44](https://github.com/adamgruber/mochawesome/issues/44)

###1.3.3
- Added support for creating custom dir where the parent dir(s) may not exist yet. See [#40](https://github.com/adamgruber/mochawesome/issues/40)

###1.3.2
- Removed `allHooks` array since it was not being used and could lead to an issue where node runs out of memory while rendering the template. See [#33](https://github.com/adamgruber/mochawesome/issues/33)

###1.3.1
- Update copyright in template

###1.3.0
- Changes to support mocha 2.4.0 and later (fixes empty code blocks). See [#29](https://github.com/adamgruber/mochawesome/issues/29)

###1.2.2
- Added option to generate report with all assets inlined. See [#26](https://github.com/adamgruber/mochawesome/issues/26)

###1.2.1
- Reset `totalTestsRegistered` when reporter is run. [PR #21](https://github.com/adamgruber/mochawesome/pull/21)

###1.2.0
- Enhancement: custom report title option. Closes [#11](https://github.com/adamgruber/mochawesome/issues/11)
- Fixed indentation in code block and stack traces

###1.1.2
- Fixes [#10](https://github.com/adamgruber/mochawesome/issues/10)

###1.1.1
- Add filter icon in summary for better visibility (Completely new idea and not at all in response to [this](https://github.com/adamgruber/mochawesome/issues/5))
- Change util.print to console.log due to [deprecation](https://github.com/joyent/node/blob/master/doc/api/util.markdown#user-content-utilprint)

###1.1.0
- Add support for options
  - custom report directory
  - custom report filename
- Enhancements to console output

###1.0.1 - 1.0.5
- Bugfixes


###1.0.0
- Redesigned report
- Mobile friendly
- Complete refactor of client-side script
- Custom builds of vendor scripts
- Custom font-icon set
- All fonts are now local to the report