#!/usr/bin/env node
// Merge any new "Suggested NOTICE.md rows" from conversion-report.md into NOTICE.md without duplicates.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function updateNotice(root = resolve('.')) {
  const noticeFile = join(root, 'NOTICE.md');
  const reportFile = join(root, 'conversion-report.md');
  if (!existsSync(noticeFile) || !existsSync(reportFile)) return 0;

  const notice = readFileSync(noticeFile, 'utf8');
  const report = readFileSync(reportFile, 'utf8');
  const split = report.split('## Suggested NOTICE.md rows');
  if (split.length < 2) return 0;

  const newRows = split[1].split('\n').filter((l) => l.startsWith('| '));
  const existingLines = notice.split('\n');
  const headerIdx = existingLines.findIndex((l) => l.startsWith('|---|'));
  const before = existingLines.slice(0, headerIdx + 1);
  const existingRows = existingLines.slice(headerIdx + 1).filter((l) => l.startsWith('| '));
  const comment = existingLines.filter((l) => l.startsWith('<!--'));

  const map = new Map();
  for (const r of [...existingRows, ...newRows]) {
    const key = r.split('|')[1]?.trim();
    if (key) map.set(key, r);
  }
  const sorted = [...map.values()].sort();
  writeFileSync(noticeFile, [...before, ...sorted, '', ...comment, ''].join('\n'));
  return sorted.length;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const total = updateNotice();
  console.log(`NOTICE.md updated (${total} rows)`);
}
