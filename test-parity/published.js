#!/usr/bin/env node
'use strict';

/**
 * Compare the current working tree's report output against a published npm
 * release ("next vs last published"). Intended as a one-off sanity check
 * before cutting a major, not a routine gate (the golden snapshots handle
 * routine work).
 *
 *   node test-parity/published.js            # compare against mochawesome@latest
 *   node test-parity/published.js 7.1.4      # compare against a specific version
 *
 * It packs the working tree, installs both the tarball and the published
 * release into separate temp projects (using the same mocha version), runs
 * the parity fixtures through each, and diffs the normalized JSON. Random /
 * environment-specific values are normalized away (see normalize.js), so a
 * clean diff means the report output is unchanged.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { createPatch } = require('diff');
const { normalize, stableStringify } = require('./normalize');

const ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(__dirname, 'fixtures');
const FIXTURE_FILES = ['spec.a.test.js', 'spec.b.test.js'];
const target = process.argv[2] || 'latest';
// Pin both installs to the mocha version this repo tests against, so the
// only variable is mochawesome itself.
const mochaVersion = require('mocha/package.json').version;

const tmpDirs = [];
function mkTmp(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tmpDirs.push(dir);
  return dir;
}
function cleanup() {
  for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });
}

function packWorkingTree() {
  const dest = mkTmp('mw-pack-');
  const out = execFileSync(
    'npm',
    ['pack', '--json', '--ignore-scripts', `--pack-destination=${dest}`],
    { cwd: ROOT }
  ).toString();
  const filename = JSON.parse(out)[0].filename;
  return path.join(dest, filename);
}

function setupProject(label, mochawesomeSpec) {
  const dir = mkTmp(`mw-${label}-`);
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: `parity-${label}`, version: '0.0.0', private: true })
  );
  for (const f of FIXTURE_FILES) {
    fs.copyFileSync(path.join(FIXTURES, f), path.join(dir, f));
  }
  execFileSync(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--silent',
      `mocha@${mochaVersion}`,
      mochawesomeSpec,
    ],
    { cwd: dir, stdio: 'inherit' }
  );
  const version = require(
    path.join(dir, 'node_modules', 'mochawesome', 'package.json')
  ).version;
  return { dir, version };
}

function runScenario(dir, name, parallel) {
  const outDir = mkTmp(`mw-out-${name}-`);
  const opts = [
    `reportDir=${outDir}`,
    `reportFilename=${name}`,
    'html=false',
    'quiet=true',
  ].join(',');
  const args = [
    ...FIXTURE_FILES,
    '--reporter',
    'mochawesome',
    '--reporter-options',
    opts,
  ];
  if (parallel) args.push('--parallel', '--require', 'mochawesome/register');

  try {
    // Fixtures contain intentional failures; a non-zero exit is expected.
    execFileSync(path.join(dir, 'node_modules', '.bin', 'mocha'), args, {
      cwd: dir,
      stdio: 'ignore',
    });
  } catch {
    /* expected */
  }

  const jsonPath = path.join(outDir, `${name}.json`);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`[${name}] reporter did not produce ${jsonPath}`);
  }
  const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  return stableStringify(normalize(report, { cwd: dir }));
}

function main() {
  console.log(`Packing working tree and installing mochawesome@${target}`);
  console.log(`(both projects pinned to mocha@${mochaVersion})\n`);

  const tarball = packWorkingTree();
  const previous = setupProject('prev', `mochawesome@${target}`);
  const current = setupProject('curr', tarball);

  console.log(
    `\nComparing current working tree vs published ${previous.version}\n`
  );

  let failed = false;
  for (const { name, parallel } of [
    { name: 'serial', parallel: false },
    { name: 'parallel', parallel: true },
  ]) {
    const prev = runScenario(previous.dir, name, parallel);
    const curr = runScenario(current.dir, name, parallel);
    if (prev === curr) {
      console.log(`ok: ${name} output matches published ${previous.version}`);
    } else {
      failed = true;
      console.error(`\nMISMATCH: ${name} output differs from published`);
      console.error(
        createPatch(
          `${name}.json`,
          prev,
          curr,
          `published ${previous.version}`,
          'current'
        )
      );
    }
  }

  if (failed) {
    console.error(
      '\nReport output changed vs the published release. Make sure this is intentional for a major version.'
    );
    process.exitCode = 1;
  } else {
    console.log('\nparity ok: report output matches the published release');
  }
}

try {
  main();
} finally {
  cleanup();
}
