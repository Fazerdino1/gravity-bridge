#!/usr/bin/env node
// Improvement #1 & #2:
// 1. Sanitize remaining non-Antigravity references (.github/instructions, .github/copilot-instructions.md,
//    ${input:...}, ${selection}, ${file}, "GitHub Copilot" / "Copilot") across all resources.
// 2. Split oversized rules (> 24,000 bytes) into a concise <22KB rule + a full reference doc in
//    docs/rule-references/<name>-full.md so Antigravity never truncates them mid-line.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseFrontmatter, stringifyFrontmatter } from './lib/frontmatter.js';

const IGNORED = new Set(['README.md', '.gitkeep']);
const MAX_RULE_BYTES = 24000;
const TARGET_RULE_BODY_BYTES = 18500;

/**
 * Rewrite non-Antigravity paths, variables, and agent names in resource text.
 * @param {string} text
 * @returns {{ out: string, changed: boolean }}
 */
export function sanitizeContent(text) {
  let out = text;
  out = out.replace(/\.github\/copilot-instructions\.md/g, 'GEMINI.md (or AGENTS.md)');
  out = out.replace(/\.github\/instructions\/([a-zA-Z0-9_*.-]+)\.instructions\.md/g, '.agents/rules/$1.md');
  out = out.replace(/\.github\/instructions\//g, '.agents/rules/');
  out = out.replace(/\.github\/prompts\//g, '.agents/skills/');
  out = out.replace(/\.github\/agents\//g, '.agents/skills/');
  out = out.replace(/\.github\/skills\//g, '.agents/skills/');
  out = out.replace(/\$\{input:([^:}]+):([^}]+)\}/g, '<$1: $2>');
  out = out.replace(/\$\{input:([^}]+)\}/g, '<$1>');
  out = out.replace(/\$\{(?:selection|selectedText)\}/g, '<selected-code>');
  out = out.replace(/\$\{file\}/g, '<current-file>');
  out = out.replace(/\$\{workspaceFolder\}/g, '<workspace-root>');
  out = out.replace(/\bGitHub Copilot\b/g, 'Google Antigravity');
  out = out.replace(/\bCopilot Chat\b/g, 'Antigravity Chat');
  return { out, changed: out !== text };
}

/**
 * Condense a rule body so the full file stays well below 24,000 bytes, moving the full text
 * into `docs/rule-references/<name>-full.md`.
 */
function condenseOversizedRule(root, name, raw, parsed) {
  const refDir = join(root, 'docs', 'rule-references');
  mkdirSync(refDir, { recursive: true });
  const refRelPath = `docs/rule-references/${name}-full.md`;
  writeFileSync(join(root, refRelPath), raw);

  const lines = parsed.body.split('\n');
  const kept = [];
  let bytes = 0;
  for (const line of lines) {
    const lineBytes = Buffer.byteLength(`${line}\n`, 'utf8');
    if (bytes + lineBytes > TARGET_RULE_BODY_BYTES) break;
    kept.push(line);
    bytes += lineBytes;
  }
  // Ensure we don't leave an unclosed fenced code block
  const fenceCount = kept.filter((l) => /^(`{3,}|~{3,})/.test(l.trim())).length;
  if (fenceCount % 2 === 1) kept.push('```');

  kept.push(
    '',
    '---',
    '',
    `> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [${refRelPath}](../${refRelPath}). Read that file on demand when deeper details are needed.`,
    '',
  );
  return stringifyFrontmatter(parsed.data, kept.join('\n'));
}

export function sanitizeAll(root = resolve('.')) {
  let sanitizedFiles = 0;
  let splitRules = 0;

  for (const folder of ['skills', 'agents']) {
    const base = join(root, folder);
    for (const name of readdirSync(base).filter((n) => !IGNORED.has(n))) {
      const dir = join(base, name);
      if (!statSync(dir).isDirectory()) continue;
      const file = join(dir, 'SKILL.md');
      const raw = readFileSync(file, 'utf8');
      const parsed = parseFrontmatter(raw);
      const descRes = sanitizeContent(String(parsed.data.description ?? ''));
      const bodyRes = sanitizeContent(parsed.body);
      if (descRes.changed || bodyRes.changed) {
        parsed.data.description = descRes.out;
        writeFileSync(file, stringifyFrontmatter(parsed.data, bodyRes.out));
        sanitizedFiles++;
      }
    }
  }

  const rulesBase = join(root, 'rules');
  for (const fileName of readdirSync(rulesBase).filter((n) => !IGNORED.has(n) && n.endsWith('.md')).sort()) {
    const file = join(rulesBase, fileName);
    const name = fileName.slice(0, -3);
    let raw = readFileSync(file, 'utf8');
    let parsed = parseFrontmatter(raw);
    const descRes = sanitizeContent(String(parsed.data.description ?? ''));
    const bodyRes = sanitizeContent(parsed.body);
    if (descRes.changed || bodyRes.changed) {
      parsed.data.description = descRes.out;
      raw = stringifyFrontmatter(parsed.data, bodyRes.out);
      parsed = parseFrontmatter(raw);
      writeFileSync(file, raw);
      sanitizedFiles++;
    }
    if (Buffer.byteLength(raw, 'utf8') > MAX_RULE_BYTES) {
      const condensed = condenseOversizedRule(root, name, raw, parsed);
      writeFileSync(file, condensed);
      splitRules++;
    }
  }

  return { sanitizedFiles, splitRules };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { sanitizedFiles, splitRules } = sanitizeAll();
  console.log(`Sanitized ${sanitizedFiles} resource(s); condensed ${splitRules} oversized rule(s) (<24KB) with full reference backups.`);
}
