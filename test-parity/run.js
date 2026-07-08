#!/usr/bin/env node
'use strict';

/**
 * Report-output parity gate.
 *
 * Runs a deterministic fixture suite through the local reporter (serial and
 * parallel), normalizes the generated JSON, and compares it against the
 * committed golden snapshots in test-parity/golden.
 *
 *   node test-parity/run.js            # verify (exit 1 on any mismatch)
 *   node test-parity/run.js --update   # rewrite the golden snapshots
 *
 * When the report output changes on purpose, run with --update and commit
 * the golden diff so the change is reviewable in the PR.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { createPatch } = require('diff');
const { normalize, stableStringify } = require('./normalize');

const ROOT = path.resolve(__dirname, '..');
const GOLDEN_DIR = path.join(__dirname, 'golden');
const FIXTURES = path.join(__dirname, 'fixtures');
const REPORTER = path.join(ROOT, 'src', 'mochawesome.js');
const REGISTER = path.join(ROOT, 'register.js');
const MOCHA_BIN = require.resolve('mocha/bin/mocha.js');

const update = process.argv.includes('--update');

const scenarios = [
  { name: 'serial', parallel: false },
  { name: 'parallel', parallel: true },
];

function runScenario({ name, parallel }) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `mw-parity-${name}-`));
  const opts = [
    `reportDir=${outDir}`,
    `reportFilename=${name}`,
    'html=false',
    'quiet=true',
  ].join(',');

  const args = [
    MOCHA_BIN,
    path.join(FIXTURES, 'spec.a.test.js'),
    path.join(FIXTURES, 'spec.b.test.js'),
    '--reporter',
    REPORTER,
    '--reporter-options',
    opts,
  ];
  if (parallel) args.push('--parallel', '--require', REGISTER);

  try {
    // Fixtures contain intentional failures, so a non-zero exit is expected.
    execFileSync('node', args, { cwd: ROOT, stdio: 'ignore' });
  } catch {
    /* expected: intentional test failures */
  }

  const jsonPath = path.join(outDir, `${name}.json`);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`[${name}] reporter did not produce ${jsonPath}`);
  }
  const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  fs.rmSync(outDir, { recursive: true, force: true });
  return stableStringify(normalize(report, { cwd: ROOT }));
}

function main() {
  if (update) fs.mkdirSync(GOLDEN_DIR, { recursive: true });
  let failed = false;

  for (const scenario of scenarios) {
    const actual = runScenario(scenario);
    const goldenPath = path.join(GOLDEN_DIR, `${scenario.name}.json`);

    if (update) {
      fs.writeFileSync(goldenPath, actual);
      console.log(`updated golden: ${path.relative(ROOT, goldenPath)}`);
      continue;
    }

    if (!fs.existsSync(goldenPath)) {
      console.error(
        `missing golden: ${path.relative(ROOT, goldenPath)} — run \`npm run test:parity:update\``
      );
      failed = true;
      continue;
    }

    const expected = fs.readFileSync(goldenPath, 'utf8');
    if (actual === expected) {
      console.log(`ok: ${scenario.name} report matches golden`);
    } else {
      failed = true;
      console.error(`\nMISMATCH: ${scenario.name} report differs from golden`);
      console.error(
        createPatch(
          `${scenario.name}.json`,
          expected,
          actual,
          'golden',
          'current'
        )
      );
    }
  }

  if (failed) {
    console.error(
      '\nReport output changed. If intentional, run `npm run test:parity:update` and commit the golden diff.'
    );
    process.exit(1);
  }
  console.log('\nparity ok: report output matches committed snapshots');
}

main();
