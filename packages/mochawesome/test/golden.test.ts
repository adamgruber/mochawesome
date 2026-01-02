import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, it, expect } from 'vitest';
import schema from '../src/schema/mochawesome-report-8.schema.json';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

describe('golden report fixtures', () => {
  it('basic.mochawesome.json matches schema', () => {
    const p = path.join(__dirname, 'golden', 'basic.mochawesome.json');
    const report = JSON.parse(fs.readFileSync(p, 'utf8'));

    const ok = validate(report);
    if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));

    expect(report).toMatchSnapshot();
  });
});
