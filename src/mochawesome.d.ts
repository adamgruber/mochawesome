// Type definitions for mochawesome 7.0
// Project: https://github.com/adamgruber/mochawesome
// Definitions by: Adam Gruber <https://adamgruber.com>

declare namespace Mochawesome {
  interface ReporterOptions {
    'no-code': boolean;
    code: boolean;
    consoleReporter: string;
    html: boolean;
    json: boolean;
    quiet: boolean;
    reportFilename: string;
  }

  interface Options {
    inlineDiffs?: boolean;
    reporterOptions?: Partial<ReporterOptions>;
  }

  interface Config {
    code: boolean;
    consoleReporter: string;
    quiet: boolean;
    reportFilename: string;
    saveHtml: boolean;
    saveJson: boolean;
    useInlineDiffs: boolean;
  }

  interface MargeOptions extends Options {
    reportFilename: string;
    saveHtml: boolean;
    saveJson: boolean;
  }
}
