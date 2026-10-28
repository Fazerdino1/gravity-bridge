#!/usr/bin/env node
// CLI: validate every resource in the repository. Exits non-zero on errors.
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { validate } from './lib/validator.js';

const { values } = parseArgs({ options: { root: { type: 'string', default: '.' } } });
const { errors, warnings, checked } = validate({ root: resolve(values.root) });

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
console.log(`${checked} resource(s) checked, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exitCode = errors.length ? 1 : 0;
