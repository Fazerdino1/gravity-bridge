#!/usr/bin/env node
// CLI: convert a local awesome-copilot clone into Gravity Bridge resources.
// Usage: node scripts/convert.js --source <path> --out . [--type <t>] [--only <name>] [--dry-run] [--force]
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { convert, renderReport, TYPES } from './lib/converter.js';

const HELP = `Usage: node scripts/convert.js --source <awesome-copilot-clone> [--out .]
  [--type ${TYPES.join('|')}]... [--only <name>]... [--dry-run] [--force]
  [--source-url <url>] [--commit <sha>]`;

function main() {
  let args;
  try {
    args = parseArgs({
      options: {
        source: { type: 'string' },
        out: { type: 'string', default: '.' },
        type: { type: 'string', multiple: true },
        only: { type: 'string', multiple: true },
        'dry-run': { type: 'boolean', default: false },
        force: { type: 'boolean', default: false },
        'source-url': { type: 'string' },
        commit: { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }).values;
  } catch (err) {
    console.error(`${err.message}\n${HELP}`);
    return 2;
  }
  if (args.help) { console.log(HELP); return 0; }
  if (!args.source) { console.error(`--source is required\n${HELP}`); return 2; }

  let result;
  try {
    result = convert({
      source: args.source,
      out: args.out,
      types: args.type,
      only: args.only,
      dryRun: args['dry-run'],
      force: args.force,
      sourceUrl: args['source-url'],
      commit: args.commit,
    });
  } catch (err) {
    console.error(`error: ${err.message}`);
    return 1;
  }
  const report = renderReport(result);
  if (args['dry-run']) {
    console.log(report);
  } else {
    const file = join(resolve(args.out), 'conversion-report.md');
    writeFileSync(file, report);
    console.log(`Report written to ${file}`);
  }
  console.log(`converted: ${result.converted.length}, unchanged: ${result.unchanged.length}, skipped: ${result.skipped.length}, manual review: ${result.manual.length}`);
  return 0;
}

process.exitCode = main();
