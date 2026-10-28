// Project rename: replaces the project name and slug in every text file.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git']);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) out.push(...walk(join(dir, e.name))); }
    else if (e.isFile()) out.push(join(dir, e.name));
  }
  return out.sort();
}

const countOf = (text, needle) => (needle ? text.split(needle).length - 1 : 0);

/**
 * Rename the project. Reads the current name/slug from project.config.json.
 * @param {{ root: string, name: string, slug: string, dryRun?: boolean }} options
 * @returns {{ from: { name: string, slug: string }, changes: { file: string, count: number }[] }}
 */
export function rename({ root, name, slug, dryRun = false }) {
  if (!name?.trim()) throw new Error('--name is required');
  if (!SLUG_RE.test(slug ?? '')) throw new Error('--slug must be lowercase and hyphen-separated');
  const config = JSON.parse(readFileSync(join(root, 'project.config.json'), 'utf8'));
  const from = { name: config.name, slug: config.slug };
  const changes = [];
  for (const file of walk(root)) {
    const buf = readFileSync(file);
    if (buf.subarray(0, 8000).includes(0)) continue; // binary
    const text = buf.toString('utf8');
    const count = countOf(text, from.name) + countOf(text, from.slug);
    if (!count) continue;
    changes.push({ file: relative(root, file).split(sep).join('/'), count });
    if (!dryRun) writeFileSync(file, text.split(from.name).join(name).split(from.slug).join(slug));
  }
  return { from, changes };
}
