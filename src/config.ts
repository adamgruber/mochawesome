/**
 * Retrieve the value of a user supplied option.
 * Falls back to `defaultValue`
 * Order of precedence
 *  1. User-supplied option
 *  2. Environment variable
 *  3. Default value
 */
function get(optToGet: string, options: any, defaultValue: string | boolean) {
  const optionValue = options && options[optToGet];
  const envVar = `MOCHAWESOME_${optToGet.toUpperCase()}`;
  const envValue = process.env[envVar];
  const isBool = typeof defaultValue === 'boolean';

  if (optionValue !== undefined) {
    return isBool && typeof optionValue === 'string'
      ? optionValue === 'true'
      : optionValue;
  }

  if (envValue !== undefined) {
    return isBool ? envValue === 'true' : envValue;
  }

  return defaultValue;
}

function getMochawesomeConfig(opts: Mochawesome.Options): Mochawesome.Config {
  const { reporterOptions } = opts || {};
  const code = get('code', reporterOptions, true);
  const noCode = get('no-code', reporterOptions, false);

  return {
    quiet: get('quiet', reporterOptions, false),
    reportFilename: get('reportFilename', reporterOptions, 'mochawesome'),
    saveHtml: get('html', reporterOptions, true),
    saveJson: get('json', reporterOptions, true),
    consoleReporter: get('consoleReporter', reporterOptions, 'spec'),
    useInlineDiffs: !!opts.inlineDiffs,
    code: noCode ? false : code,
  };
}

export default getMochawesomeConfig;
