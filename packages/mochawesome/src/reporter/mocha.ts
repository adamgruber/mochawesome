import fs from 'node:fs';
import path from 'node:path';
import { createReport } from '../core/model';

export default class Mochawesome {
  constructor(runner: any, options: any) {
    const rawDir = options?.reporterOptions?.reportDir ?? 'mochawesome-report';
    const reportDir = path.isAbsolute(rawDir)
      ? rawDir
      : path.resolve(process.cwd(), rawDir);
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, '.loaded'), 'ok', 'utf8');

    runner.once('end', () => {
      const now = new Date().toISOString();

      const report = createReport({
        schemaVersion: '8.0.0-alpha.0',
        meta: {
          generatedAt: now,
          durationMs: 0,
          runner: { name: 'mocha', version: '0.0.0' },
          reporter: { name: 'mochawesome', version: '8.0.0-alpha.0' },
          output: {
            reportDir,
            htmlFile: 'mochawesome.html',
            jsonFile: 'mochawesome.json',
            assetsDir: 'assets',
            assetMode: 'inline',
            attachmentMode: 'link',
          },
        },
        stats: {
          suites: 0,
          tests: 0,
          passes: 0,
          failures: 0,
          pending: 0,
          skipped: 0,
          start: now,
          end: now,
          durationMs: 0,
        },
        rootSuite: {
          id: 's0',
          title: '',
          fullTitle: '',
          timing: { start: now, end: now, durationMs: 0 },
          suites: [],
          tests: [],
          hooks: [],
        },
      });

      const out = path.join(reportDir, 'mochawesome.json');
      fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
    });
  }
}
