// Resource validator. See docs/antigravity-format.md and docs/curation-policy.md.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parseFrontmatter } from './frontmatter.js';
import { ALLOWED_LICENSES } from './license.js';
import { findDangerousCommands, findInjection, findSecrets } from './scanners.js';

export const PROVENANCE_FIELDS = ['source_url', 'source_path', 'source_commit', 'source_license', 'converted_at', 'converter_version', 'status'];
export const STATUSES = ['draft', 'reviewed', 'tested'];
// TODO(verify): complete list of Antigravity rule triggers.
export const RULE_TRIGGERS = ['always_on', 'model_decision'];
const RULE_MAX_BYTES = 24000;
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IGNORED = new Set(['README.md', '.gitkeep']);

const toPosix = (p) => p.split(sep).join('/');

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

function entries(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((n) => !IGNORED.has(n)).sort() : [];
}

/**
 * Validate all resources under `root`.
 * @param {{ root: string }} options
 * @returns {{ errors: string[], warnings: string[], checked: number }}
 */
export function validate({ root }) {
  const errors = [];
  const warnings = [];
  const notice = existsSync(join(root, 'NOTICE.md')) ? readFileSync(join(root, 'NOTICE.md'), 'utf8') : '';
  let checked = 0;

  const checkName = (rel, name) => {
    if (!NAME_RE.test(name)) errors.push(`${rel}: name "${name}" must be lowercase and hyphen-separated`);
  };

  const scanFile = (file) => {
    const rel = toPosix(relative(root, file));
    const buf = readFileSync(file);
    if (buf.subarray(0, 8000).includes(0)) return;
    const content = buf.toString('utf8');
    for (const h of findSecrets(content)) errors.push(`${rel}:${h.line}: possible secret (${h.label})`);
    for (const h of findDangerousCommands(content)) warnings.push(`${rel}:${h.line}: dangerous command for human review (${h.label})`);
    for (const h of findInjection(content)) warnings.push(`${rel}:${h.line}: instruction-like text for human review (${h.label})`);
  };

  const checkCommon = (rel, data) => {
    if (!STATUSES.includes(data.status)) errors.push(`${rel}: status must be one of ${STATUSES.join(', ')}`);
    if (!data.source_url) return; // original contribution, covered by the repository MIT license
    for (const f of PROVENANCE_FIELDS) if (!data[f]) errors.push(`${rel}: missing provenance field "${f}"`);
    if (data.source_license && !ALLOWED_LICENSES.includes(data.source_license)) {
      errors.push(`${rel}: license "${data.source_license}" is not allowed`);
    }
    if (data.source_path && !notice.includes(String(data.source_path))) {
      errors.push(`${rel}: source path "${data.source_path}" is not listed in NOTICE.md`);
    }
  };

  const checkDescription = (rel, data) => {
    if (typeof data.description !== 'string' || !data.description.trim()) errors.push(`${rel}: missing "description"`);
    else if (data.description.length > 1024) errors.push(`${rel}: description longer than 1024 characters`);
  };

  for (const folder of ['skills', 'agents']) {
    for (const name of entries(join(root, folder))) {
      const dir = join(root, folder, name);
      const rel = `${folder}/${name}`;
      if (!statSync(dir).isDirectory()) { errors.push(`${rel}: expected a directory`); continue; }
      checkName(rel, name);
      const file = join(dir, 'SKILL.md');
      if (!existsSync(file)) { errors.push(`${rel}: missing SKILL.md`); continue; }
      checked++;
      const { data, error, hasFrontmatter } = parseFrontmatter(readFileSync(file, 'utf8'));
      if (!hasFrontmatter || error) { errors.push(`${rel}/SKILL.md: ${error ?? 'missing front matter'}`); continue; }
      if (data.name !== name) errors.push(`${rel}/SKILL.md: "name" must equal the folder name "${name}"`);
      checkDescription(`${rel}/SKILL.md`, data);
      checkCommon(`${rel}/SKILL.md`, data);
      for (const f of walk(dir)) scanFile(f);
    }
  }

  for (const folder of ['rules', 'workflows']) {
    for (const name of entries(join(root, folder))) {
      const file = join(root, folder, name);
      const rel = `${folder}/${name}`;
      if (!name.endsWith('.md')) { errors.push(`${rel}: expected a .md file`); continue; }
      checkName(rel, name.slice(0, -3));
      checked++;
      const raw = readFileSync(file, 'utf8');
      const { data, error, hasFrontmatter } = parseFrontmatter(raw);
      if (!hasFrontmatter || error) { errors.push(`${rel}: ${error ?? 'missing front matter'}`); continue; }
      if (folder === 'rules') {
        if (!RULE_TRIGGERS.includes(data.trigger)) errors.push(`${rel}: trigger must be one of ${RULE_TRIGGERS.join(', ')}`);
        if (Buffer.byteLength(raw, 'utf8') > RULE_MAX_BYTES) {
          const msg = `${rel}: larger than ${RULE_MAX_BYTES} bytes`;
          if (data.status === 'draft') warnings.push(`${msg} (will be truncated by Antigravity unless trimmed before review)`);
          else errors.push(msg);
        }
      } else {
        warnings.push(`${rel}: workflows are deprecated in Antigravity; prefer a skill`);
      }
      checkDescription(rel, data);
      checkCommon(rel, data);
      scanFile(file);
    }
  }

  for (const name of entries(join(root, 'collections'))) {
    const rel = `collections/${name}`;
    if (!/\.ya?ml$/.test(name)) { errors.push(`${rel}: expected a .yml file`); continue; }
    checkName(rel, name.replace(/\.ya?ml$/, ''));
    checked++;
    const { data, error } = parseFrontmatter(`---\n${readFileSync(join(root, 'collections', name), 'utf8')}\n---\n`);
    if (error) { errors.push(`${rel}: ${error}`); continue; }
    if (!Array.isArray(data.items)) { errors.push(`${rel}: "items" must be a list`); continue; }
    for (const it of data.items) {
      if (!it?.path || !existsSync(join(root, it.path))) errors.push(`${rel}: item path "${it?.path}" does not exist`);
    }
  }

  return { errors, warnings, checked };
}
