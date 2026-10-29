#!/usr/bin/env node
// Improvement #12: Security audit of all bundled scripts inside skills/*/scripts/ and agents/*/scripts/.
// Generates docs/scripts-security-audit.md and reports any network, subprocess, or eval usage.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { findDangerousCommands, findScriptCapabilities, findSecrets } from './lib/scanners.js';

const toPosix = (p) => p.split(sep).join('/');

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile()) out.push(p);
  }
  return out.sort();
}

export function auditBundledScripts(root = resolve('.')) {
  const findings = [];
  let scriptCount = 0;

  for (const folder of ['skills', 'agents']) {
    const base = join(root, folder);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base).sort()) {
      const scriptsDir = join(base, name, 'scripts');
      if (!existsSync(scriptsDir) || !statSync(scriptsDir).isDirectory()) continue;
      for (const file of walk(scriptsDir)) {
        const buf = readFileSync(file);
        if (buf.subarray(0, 8000).includes(0)) continue;
        scriptCount++;
        const text = buf.toString('utf8');
        const rel = toPosix(relative(root, file));
        const secrets = findSecrets(text);
        const danger = findDangerousCommands(text);
        const caps = findScriptCapabilities(text);
        findings.push({
          file: rel,
          skill: `${folder}/${name}`,
          secrets: secrets.length,
          dangerous: [...new Set(danger.map((d) => d.label))],
          capabilities: [...new Set(caps.map((c) => c.label))],
        });
      }
    }
  }

  const lines = [
    '# Bundled Scripts Security Audit',
    '',
    'All scripts shipped inside `skills/*/scripts/` are copied as inert data by the converter and are **never executed automatically** during conversion or validation. Review a skill\'s bundled scripts before invoking them in Google Antigravity.',
    '',
    `- **Total bundled script files audited**: ${scriptCount}`,
    `- **Hardcoded secrets detected**: ${findings.reduce((a, f) => a + f.secrets, 0)}`,
    '',
    '| Script Path | Parent Skill | Detected Capabilities | Dangerous Patterns |',
    '|---|---|---|---|',
    ...findings.map(
      (f) =>
        `| \`${f.file}\` | \`${f.skill}\` | ${f.capabilities.join(', ') || 'none'} | ${f.dangerous.join(', ') || 'none'} |`,
    ),
    '',
  ];

  writeFileSync(join(root, 'docs', 'scripts-security-audit.md'), lines.join('\n'));
  return { scriptCount, findings };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { scriptCount } = auditBundledScripts();
  console.log(`Audited ${scriptCount} bundled script(s) → docs/scripts-security-audit.md`);
}
