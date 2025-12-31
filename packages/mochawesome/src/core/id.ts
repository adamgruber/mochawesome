import crypto from 'node:crypto';

type IdPrefix = 's' | 't' | 'h';

const ID_PART_RE = /^\d+$/;

function assertPath(path: number[]): void {
  for (const part of path) {
    if (!Number.isInteger(part) || part < 0) {
      throw new Error(`Invalid id path segment: ${part}`);
    }
  }
}

function formatId(prefix: IdPrefix, path: number[]): string {
  assertPath(path);
  return `${prefix}${path.join('.')}`;
}

function parseSuitePath(suiteId: string): number[] {
  if (!suiteId.startsWith('s')) {
    throw new Error(`Suite id must start with "s": ${suiteId}`);
  }
  const raw = suiteId.slice(1);
  const parts = raw.length === 0 ? [] : raw.split('.');
  if (!parts.every(part => ID_PART_RE.test(part))) {
    throw new Error(`Invalid suite id path: ${suiteId}`);
  }
  return parts.map(part => Number(part));
}

export function suiteId(path: number[]): string {
  return formatId('s', path);
}

export function suiteChildId(
  parentSuiteId: string,
  childIndex: number
): string {
  const parentPath = parseSuitePath(parentSuiteId);
  return suiteId([...parentPath, childIndex]);
}

export function testId(parentSuiteId: string, testIndex: number): string {
  const parentPath = parseSuitePath(parentSuiteId);
  return formatId('t', [...parentPath, testIndex]);
}

export function hookId(parentSuiteId: string, hookIndex: number): string {
  const parentPath = parseSuitePath(parentSuiteId);
  return formatId('h', [...parentPath, hookIndex]);
}

export function stableId(prefix: 's' | 't' | 'h', stableKey: string): string {
  const hash = crypto
    .createHash('sha1')
    .update(stableKey)
    .digest('hex')
    .slice(0, 12);
  return `${prefix}_${hash}`;
}
