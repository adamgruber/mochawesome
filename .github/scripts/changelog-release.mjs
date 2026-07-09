// Promotes the curated "## [Unreleased]" section of CHANGELOG.md to a dated
// release heading, opens a fresh empty Unreleased section, and writes the
// release notes for that version to a file for the GitHub release.
//
// Usage: node .github/scripts/changelog-release.mjs <version>
// Emits `file=<path>` to $GITHUB_OUTPUT (falls back to ./RELEASE_NOTES.md).

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const version = process.argv[2];
if (!version) {
  console.error('Usage: changelog-release.mjs <version>');
  process.exit(1);
}

const path = 'CHANGELOG.md';
const changelog = readFileSync(path, 'utf8');

const unreleased = /^## \[Unreleased\]\s*$/m;
if (!unreleased.test(changelog)) {
  console.error('No "## [Unreleased]" heading found in CHANGELOG.md');
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const updated = changelog.replace(
  unreleased,
  `## [Unreleased]\n\n## [${version}] - ${date}`
);
writeFileSync(path, updated);

// Grab everything between the new version heading and the next "## " heading.
const section = new RegExp(
  `^## \\[${version.replace(/\./g, '\\.')}\\][^\\n]*\\n([\\s\\S]*?)(?=^## )`,
  'm'
);
const match = updated.match(section);
const notes = (match ? match[1] : '').trim();
if (!notes) {
  console.error(`No notes found under the [Unreleased] section for ${version}`);
  process.exit(1);
}

const notesFile = 'RELEASE_NOTES.md';
writeFileSync(notesFile, notes + '\n');

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `file=${notesFile}\n`);
}
console.log(`Prepared release notes for ${version}:\n\n${notes}`);
