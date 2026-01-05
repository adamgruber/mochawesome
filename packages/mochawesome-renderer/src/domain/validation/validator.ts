import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import schema from '../../../../mochawesome/src/schema/mochawesome-report-8.schema.json';
import type { Report } from '../../../../mochawesome/src/core/model';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile<Report>(schema);

export type ValidationResult =
  | { ok: true; report: Report }
  | { ok: false; errors: string[] };

export const validateReport = (value: unknown): ValidationResult => {
  const ok = validate(value);
  if (ok) return { ok: true, report: value as Report };

  const errors = (validate.errors ?? []).map(err => {
    const path = err.instancePath || '/';
    const message = err.message ?? 'invalid value';
    return `${path} ${message}`.trim();
  });

  return { ok: false, errors };
};
