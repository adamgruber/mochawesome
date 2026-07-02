'use strict';

/**
 * Normalize a mochawesome report so two runs are comparable.
 *
 * The report legitimately contains values that vary between runs and
 * environments (random UUIDs, timings, absolute paths, stack frames).
 * Those are replaced with stable placeholders so that a diff only surfaces
 * *meaningful* changes to the report shape/content.
 */

const PLACEHOLDER = 'X';

/**
 * Strip environment-specific noise from a string value.
 * @param {string} str
 * @param {string} cwd  Project root to strip from absolute paths
 */
function scrubString(str, cwd) {
  let s = str;
  if (cwd) s = s.split(cwd).join('');
  return s.replace(/:\d+:\d+/g, ':L:C'); // stack line:col numbers
}

function transform(key, value, cwd) {
  switch (key) {
    case 'uuid':
    case 'parentUUID':
      return PLACEHOLDER;
    case 'duration':
      return 0;
    case 'speed':
      return 'S';
    case 'fullFile':
      return 'F';
    case 'estack':
      // Stack frames differ by Node version; error content is already
      // covered by `message` and `diff`, so collapse the stack entirely.
      return typeof value === 'string' ? 'E' : value;
    case 'passes':
    case 'failures':
    case 'pending':
    case 'skipped':
      // Suite reference arrays hold test UUIDs. Keep count/order, drop
      // the random values. `stats` counterparts are numbers and pass
      // through the default branch untouched.
      return Array.isArray(value) ? value.map(() => PLACEHOLDER) : value;
    default:
      if (typeof value === 'string') return scrubString(value, cwd);
      return walk(value, cwd);
  }
}

function walk(node, cwd) {
  if (Array.isArray(node)) return node.map(n => walk(n, cwd));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = transform(k, v, cwd);
    }
    // Suite ordering is non-deterministic in parallel mode; sort nested
    // suites by title so the snapshot is stable regardless of worker order.
    if (Array.isArray(out.suites)) {
      out.suites.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }
    return out;
  }
  return node;
}

function normalize(report, { cwd } = {}) {
  const r = walk(report, cwd);
  if (r.stats) {
    r.stats.start = 'T';
    r.stats.end = 'T';
    r.stats.duration = 0;
  }
  r.meta = 'M'; // versions/options are not part of the output contract
  return r;
}

/**
 * Deterministic JSON with recursively sorted object keys, so snapshots do
 * not depend on property insertion order.
 */
function stableStringify(value) {
  return JSON.stringify(sortKeys(value), null, 2) + '\n';
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortKeys(value[k]);
        return acc;
      }, {});
  }
  return value;
}

module.exports = { normalize, stableStringify };
