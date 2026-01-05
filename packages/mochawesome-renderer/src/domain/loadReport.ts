import type { Report } from '../../../mochawesome/src/core/model';
import { validateReport } from './validation/validator';

export type LoadReportOptions = {
  validate?: boolean;
};

const parseJson = (input: string): unknown => {
  try {
    return JSON.parse(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    throw new Error(`Failed to parse report JSON: ${message}`);
  }
};

export const loadReport = (
  source: string | Report,
  options: LoadReportOptions = {}
): Report => {
  const value = typeof source === 'string' ? parseJson(source) : source;
  if (options.validate === false) return value as Report;

  const result = validateReport(value);
  if (!result.ok) {
    const details = result.errors.length
      ? `\n${result.errors.map(err => `- ${err}`).join('\n')}`
      : '';
    throw new Error(`Invalid mochawesome report.${details}`);
  }

  return result.report;
};
