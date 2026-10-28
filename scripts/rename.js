#!/usr/bin/env node
// CLI: npm run rename -- --name "<New Name>" --slug "<new-slug>" [--dry-run]
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { rename } from './lib/renamer.js';

try {
  const { values } = parseArgs({
    options: {
      name: { type: 'string' },
      slug: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      root: { type: 'string', default: '.' },
    },
  });
  const dryRun = values['dry-run'];
  const { from, changes } = rename({ root: resolve(values.root), name: values.name, slug: values.slug, dryRun });
  console.log(`${dryRun ? '[dry run] ' : ''}"${from.name}" → "${values.name}", "${from.slug}" → "${values.slug}"`);
  for (const c of changes) console.log(`  ${c.file}: ${c.count} occurrence(s)`);
  console.log(`${changes.length} file(s) ${dryRun ? 'would change' : 'changed'}`);
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exitCode = 1;
}
