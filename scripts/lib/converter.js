// Conversion engine. Reads source files as plain text, maps them, adds provenance,
// and writes Antigravity resources. Source content is never executed or evaluated.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { normalizeBody, parseFrontmatter, stringifyFrontmatter } from './frontmatter.js';
import { resolveLicense } from './license.js';
import { MAPPERS } from './mappers.js';
import { findDangerousCommands, findInjection, findSecrets } from './scanners.js';

export const CONVERTER_VERSION = '0.1.0';
export const DEFAULT_SOURCE_URL = 'https://github.com/github/awesome-copilot';
export const PROTECTED_STATUSES = ['reviewed', 'tested'];

// TODO(verify): source folder layout of github/awesome-copilot (see docs/mapping.md).
const SOURCES = {
  skills: { dir: 'skills', kind: 'dir', file: 'SKILL.md' },
  instructions: { dir: 'instructions', kind: 'file', suffix: '.instructions.md' },
  prompts: { dir: 'prompts', kind: 'file', suffix: '.prompt.md' },
  agents: { dir: 'agents', kind: 'file', suffix: '.agent.md' },
};
export const TYPES = Object.keys(SOURCES);

const toPosix = (p) => p.split(sep).join('/');

/** Normalize a name to lowercase-hyphen form. */
export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function discover(sourceRoot, type) {
  const spec = SOURCES[type];
  const base = join(sourceRoot, spec.dir);
  if (!existsSync(base)) return [];
  const items = [];
  for (const entry of readdirSync(base, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (spec.kind === 'dir' && entry.isDirectory()) {
      const file = join(base, entry.name, spec.file);
      if (existsSync(file)) items.push({ type, name: slugify(entry.name), file, itemDir: join(base, entry.name) });
    } else if (spec.kind === 'file' && entry.isFile() && entry.name.endsWith(spec.suffix)) {
      items.push({ type, name: slugify(entry.name.slice(0, -spec.suffix.length)), file: join(base, entry.name) });
    }
  }
  return items;
}

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else if (entry.isFile()) out.push(p);
  }
  return out.sort();
}

function git(sourceRoot, args) {
  try {
    // Runs git on the clone to read metadata only; no source file is executed.
    return execFileSync('git', ['-C', sourceRoot, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/** True when `sourceRoot` is the top level of its own git repository. */
function isGitRoot(sourceRoot) {
  const top = git(sourceRoot, ['rev-parse', '--show-toplevel']);
  return top !== null && resolve(top) === resolve(sourceRoot);
}

function sourceCommit(sourceRoot) {
  return isGitRoot(sourceRoot) ? git(sourceRoot, ['rev-parse', 'HEAD']) : null;
}

/** Author of the commit that first added the file (following renames). */
function firstAuthor(sourceRoot, sourcePath) {
  const log = git(sourceRoot, ['log', '--follow', '--format=%an', '--', sourcePath]);
  return log ? log.split('\n').pop() : null;
}

function withoutTimestamp(data) {
  const { converted_at: _ignored, ...rest } = data;
  return JSON.stringify(rest);
}

function isText(buf) {
  return !buf.subarray(0, 8000).includes(0);
}

function scanAll(label, content, record) {
  for (const h of findSecrets(content)) record.manual.push(`${label}:${h.line} possible secret (${h.label})`);
  for (const h of findDangerousCommands(content)) record.manual.push(`${label}:${h.line} dangerous command (${h.label})`);
  for (const h of findInjection(content)) {
    record.manual.push(`${label}:${h.line} instruction-like text (${h.label}); kept verbatim as inert data`);
  }
}

/**
 * Convert awesome-copilot items into this repository.
 * @param {{ source: string, out: string, types?: string[], only?: string[], dryRun?: boolean, force?: boolean,
 *           sourceUrl?: string, commit?: string, now?: Date }} options
 */
export function convert(options) {
  const sourceRoot = resolve(options.source);
  const outRoot = resolve(options.out ?? '.');
  const types = options.types?.length ? options.types : TYPES;
  const only = options.only?.length ? new Set(options.only.map(slugify)) : null;
  const sourceUrl = (options.sourceUrl ?? DEFAULT_SOURCE_URL).replace(/\/+$/, '');
  const now = (options.now ?? new Date()).toISOString();
  const result = { converted: [], unchanged: [], skipped: [], manual: [], warnings: [], noticeRows: [], dryRun: !!options.dryRun };

  if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) {
    throw new Error(`source directory not found: ${sourceRoot}`);
  }
  for (const t of types) if (!SOURCES[t]) throw new Error(`unknown type: ${t} (expected ${TYPES.join(', ')})`);

  let commit = options.commit ?? sourceCommit(sourceRoot);
  if (!commit) {
    commit = 'unknown';
    result.warnings.push('source commit unknown: pass --commit or use a git clone');
  }

  const written = new Set();
  const useGitAuthor = isGitRoot(sourceRoot);
  for (const type of types) {
    for (const item of discover(sourceRoot, type)) {
      if (only && !only.has(item.name)) continue;
      const sourcePath = toPosix(relative(sourceRoot, item.file));
      const record = { type, name: item.name, sourcePath, target: null, warnings: [], manual: [] };
      const skip = (reason) => result.skipped.push({ ...record, reason });

      const license = resolveLicense(sourceRoot, item.file);
      if (!license) { skip('no license found'); continue; }
      if (!license.allowed) { skip(`license not allowed or not recognized (${license.spdx ?? 'unknown'} in ${license.file})`); continue; }

      const raw = readFileSync(item.file, 'utf8');
      const parsed = parseFrontmatter(raw);
      if (parsed.error) { skip(`front matter error: ${parsed.error}`); continue; }
      if (!item.name) { skip('empty name after normalization'); continue; }
      const declared = typeof parsed.data.license === 'string' ? parsed.data.license.trim() : '';
      if (/^[A-Za-z0-9.+-]+$/.test(declared) && declared !== license.spdx) {
        skip(`declared license "${declared}" differs from ${license.file} (${license.spdx}); check manually`); continue;
      }

      const mapped = MAPPERS[type]({ name: item.name, data: parsed.data, body: parsed.body });
      record.target = mapped.target;
      record.warnings.push(...mapped.warnings);
      record.manual.push(...mapped.manual);
      scanAll(sourcePath, raw, record);

      if (written.has(mapped.target)) { skip(`target collision: ${mapped.target} already produced in this run`); continue; }

      const author = typeof parsed.data.author === 'string'
        ? parsed.data.author
        : (useGitAuthor ? firstAuthor(sourceRoot, sourcePath) ?? undefined : undefined);
      const frontmatter = {
        ...mapped.frontmatter,
        source_url: sourceUrl,
        source_path: sourcePath,
        source_commit: commit,
        source_license: license.spdx,
        source_copyright: license.copyright ?? undefined,
        source_author: author,
        converted_at: now,
        converter_version: CONVERTER_VERSION,
        status: 'draft',
      };
      if (!license.copyright) record.warnings.push(`no copyright line found in ${license.file}`);

      const targetFile = join(outRoot, mapped.target);
      if (existsSync(targetFile)) {
        const existing = parseFrontmatter(readFileSync(targetFile, 'utf8'));
        if (existing.data.source_path && existing.data.source_path !== sourcePath && !options.force) {
          skip(`target exists with a different source (${existing.data.source_path}); use --force`); continue;
        }
        if (PROTECTED_STATUSES.includes(existing.data.status) && !options.force) {
          skip(`target has status "${existing.data.status}"; use --force to overwrite`); continue;
        }
        if (withoutTimestamp(existing.data) === withoutTimestamp(frontmatter) && existing.body === normalizeBody(mapped.body)) {
          written.add(mapped.target);
          result.unchanged.push(record);
          continue;
        }
      }

      const extras = [];
      if (item.itemDir) {
        for (const f of listFiles(item.itemDir)) {
          if (f === item.file) continue;
          const rel = toPosix(relative(item.itemDir, f));
          const buf = readFileSync(f);
          if (isText(buf)) scanAll(`${toPosix(relative(sourceRoot, f))}`, buf.toString('utf8'), record);
          if (/^scripts\//.test(rel)) record.manual.push(`${rel}: script copied as data (never executed); review before use`);
          extras.push({ rel, buf });
        }
      }

      if (!options.dryRun) {
        mkdirSync(dirname(targetFile), { recursive: true });
        writeFileSync(targetFile, stringifyFrontmatter(frontmatter, mapped.body));
        for (const { rel, buf } of extras) {
          const dest = join(dirname(targetFile), rel);
          mkdirSync(dirname(dest), { recursive: true });
          if (!existsSync(dest) || !readFileSync(dest).equals(buf)) writeFileSync(dest, buf);
        }
      }
      written.add(mapped.target);
      record.extras = extras.map((e) => e.rel);
      result.converted.push(record);
      result.noticeRows.push(
        `| \`${mapped.target}\` | ${sourceUrl} | \`${sourcePath}\` | \`${commit.slice(0, 12)}\` | ${author ?? 'unknown'} | ${license.spdx} | ${license.copyright ?? 'TODO'} | ${now.slice(0, 10)} |`,
      );
    }
  }
  for (const r of [...result.converted, ...result.unchanged]) if (r.manual.length) result.manual.push(r);
  return result;
}

/** Render a Markdown conversion report. */
export function renderReport(result) {
  const lines = ['# Conversion report', '', `Converter version: ${CONVERTER_VERSION}${result.dryRun ? ' (dry run — nothing written)' : ''}`, ''];
  const section = (title, rows, fmt) => {
    lines.push(`## ${title} (${rows.length})`, '');
    if (!rows.length) lines.push('_None._');
    for (const r of rows) lines.push(fmt(r));
    lines.push('');
  };
  section('Converted', result.converted, (r) => `- \`${r.sourcePath}\` → \`${r.target}\`${r.extras?.length ? ` (+${r.extras.length} files)` : ''}`);
  section('Unchanged', result.unchanged, (r) => `- \`${r.target}\``);
  section('Skipped', result.skipped, (r) => `- \`${r.sourcePath}\`: ${r.reason}`);
  section('Manual review', result.manual, (r) => [`- \`${r.target}\``, ...r.manual.map((m) => `  - ${m}`)].join('\n'));
  const warns = [...result.warnings.map((w) => `- ${w}`), ...[...result.converted, ...result.unchanged].flatMap((r) => r.warnings.map((w) => `- \`${r.target}\`: ${w}`))];
  lines.push(`## Warnings (${warns.length})`, '', ...(warns.length ? warns : ['_None._']), '');
  lines.push('## Suggested NOTICE.md rows', '', ...(result.noticeRows.length ? result.noticeRows : ['_None._']), '');
  return lines.join('\n');
}
