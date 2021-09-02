import chalk from 'chalk';
import jsonStringify from 'json-stringify-safe';

type LogMessage = string | object;

class Logger {
  logger: Console;
  config: Mochawesome.Config;
  prefix: string;

  constructor(logger: Console, config: Mochawesome.Config) {
    this.logger = logger;
    this.config = config;
    this.prefix = `[${chalk.gray('mochawesome')}] `; //${out}\n`
  }

  getMessage(message: LogMessage) {
    const msg =
      typeof message === 'object' ? jsonStringify(message, null, 2) : message;
    return `${this.prefix}${msg}\n`;
  }

  log(message: LogMessage) {
    if (!this.config.quiet) {
      this.logger.log(this.getMessage(message));
    }
  }

  error(message: LogMessage) {
    if (!this.config.quiet) {
      this.logger.error(this.getMessage(message));
    }
  }

  warn(message: LogMessage) {
    if (!this.config.quiet) {
      this.logger.warn(this.getMessage(message));
    }
  }
}

export default Logger;
