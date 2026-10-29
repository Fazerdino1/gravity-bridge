#!/usr/bin/env node
// Improvement #5: Build installable Google Antigravity plugins from collections/*.yml.
// Output structure per collection:
//   plugins/<id>/
//   ├── plugin.json
//   ├── README.md
//   ├── references/<rule>.md (full rule documentation for on-demand reading)
//   ├── skills/<skill>/SKILL.md (+ extra files)
//   └── rules/AGENTS.md (compact rules summary <= 3,500 bytes to stay under Antigravity's 20k-token rules budget)
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { parseFrontmatter } from './lib/frontmatter.js';

const MAX_RULE_SUMMARY_CHARS = 700;

function summarizeRuleBody(body, ruleSlug) {
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const picked = [];
  let total = 0;

  for (const line of lines) {
    if (line.startsWith('```') || line.startsWith('|')) continue;
    const isHeading = /^#{1,3}\s+/.test(line);
    const isBullet = /^[-*]\s+/.test(line);
    const isApplyHint = line.startsWith('Apply this rule');
    if (isHeading || isBullet || isApplyHint) {
      if (total + line.length + 1 > MAX_RULE_SUMMARY_CHARS) break;
      picked.push(line);
      total += line.length + 1;
    }
  }

  if (!picked.length) {
    picked.push(body.slice(0, MAX_RULE_SUMMARY_CHARS).trim());
  }

  picked.push(
    `> Full reference inside this plugin: \`references/${ruleSlug}.md\` (read on demand when working on matching files).`,
  );
  return picked.join('\n');
}

export function buildPlugins(root = resolve('.')) {
  const colDir = join(root, 'collections');
  const outBase = join(root, 'plugins');
  mkdirSync(outBase, { recursive: true });
  const built = [];

  for (const file of readdirSync(colDir).filter((f) => /\.ya?ml$/.test(f)).sort()) {
    const col = YAML.parse(readFileSync(join(colDir, file), 'utf8'));
    const id = col.id || file.replace(/\.ya?ml$/, '');
    const pluginDir = join(outBase, `gravity-${id}`);
    rmSync(pluginDir, { recursive: true, force: true });
    mkdirSync(pluginDir, { recursive: true });

    const ruleBlocks = [];
    const skillNames = [];

    for (const item of col.items ?? []) {
      const srcPath = join(root, item.path);
      if (!existsSync(srcPath)) continue;
      if (item.path.startsWith('rules/')) {
        const ruleSlug = basename(item.path, '.md');
        const { body } = parseFrontmatter(readFileSync(srcPath, 'utf8'));
        const refsDir = join(pluginDir, 'references');
        mkdirSync(refsDir, { recursive: true });
        writeFileSync(join(refsDir, `${ruleSlug}.md`), `${body.trim()}\n`);
        ruleBlocks.push(`<!-- Source: ${item.path} -->\n${summarizeRuleBody(body.trim(), ruleSlug)}`);
      } else if (item.path.startsWith('skills/') || item.path.startsWith('agents/')) {
        const sName = basename(item.path);
        const destSkillDir = join(pluginDir, 'skills', sName);
        mkdirSync(destSkillDir, { recursive: true });
        cpSync(srcPath, destSkillDir, { recursive: true });
        skillNames.push(sName);
      }
    }

    if (ruleBlocks.length) {
      const rulesDir = join(pluginDir, 'rules');
      mkdirSync(rulesDir, { recursive: true });
      writeFileSync(join(rulesDir, 'AGENTS.md'), `${ruleBlocks.join('\n\n---\n\n')}\n`);
    }

    const pluginJson = {
      name: `gravity-${id}`,
      description: col.description || col.name,
      suggestedPrompts: skillNames.slice(0, 3).map((s) => `Use /${s} on this project`),
    };
    writeFileSync(join(pluginDir, 'plugin.json'), `${JSON.stringify(pluginJson, null, 2)}\n`);

    const readme = [
      `# ${col.name} (\`gravity-${id}\`)`,
      '',
      col.description,
      '',
      '## Install in Google Antigravity',
      '',
      'Copy this folder into `~/.gemini/config/plugins/` and restart Antigravity:',
      '',
      '```sh',
      `cp -r plugins/gravity-${id} ~/.gemini/config/plugins/`,
      '```',
      '',
      '## Included items',
      '',
      ...(col.items ?? []).map((i) => `- \`${i.path}\``),
      '',
    ].join('\n');
    writeFileSync(join(pluginDir, 'README.md'), readme);
    built.push({ id: `gravity-${id}`, skills: skillNames.length, rules: ruleBlocks.length });
  }

  return built;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const built = buildPlugins();
  console.log(`Built ${built.length} Antigravity plugin(s):`, built.map((b) => `${b.id} (${b.skills} skills, ${b.rules} rules)`).join(', '));
}
