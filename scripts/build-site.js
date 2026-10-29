#!/usr/bin/env node
// Build script for the Gravity Bridge website (website/catalog.json).
// Reads all skills, rules, and agents in the repository and writes a compact JSON index.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseFrontmatter } from './lib/frontmatter.js';

const IGNORED = new Set(['README.md', '.gitkeep']);

export function buildCatalog(root = resolve('.')) {
  const items = [];

  for (const folder of ['skills', 'agents']) {
    const base = join(root, folder);
    for (const name of readdirSync(base).filter((n) => !IGNORED.has(n)).sort()) {
      const dir = join(base, name);
      if (!statSync(dir).isDirectory()) continue;
      const file = join(dir, 'SKILL.md');
      const { data } = parseFrontmatter(readFileSync(file, 'utf8'));
      items.push({
        type: folder === 'skills' ? 'skill' : 'agent',
        name,
        path: `${folder}/${name}/SKILL.md`,
        description: String(data.description ?? ''),
        status: String(data.status ?? 'draft'),
        author: String(data.source_author ?? 'Community'),
        license: String(data.source_license ?? 'MIT'),
      });
    }
  }

  const rulesBase = join(root, 'rules');
  for (const file of readdirSync(rulesBase).filter((n) => !IGNORED.has(n) && n.endsWith('.md')).sort()) {
    const name = file.slice(0, -3);
    const { data } = parseFrontmatter(readFileSync(join(rulesBase, file), 'utf8'));
    items.push({
      type: 'rule',
      name,
      path: `rules/${file}`,
      trigger: String(data.trigger ?? 'model_decision'),
      description: String(data.description ?? ''),
      status: String(data.status ?? 'draft'),
      author: String(data.source_author ?? 'Community'),
      license: String(data.source_license ?? 'MIT'),
    });
  }

  const outDir = join(root, 'website');
  mkdirSync(outDir, { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    counts: {
      total: items.length,
      skills: items.filter((i) => i.type === 'skill').length,
      rules: items.filter((i) => i.type === 'rule').length,
      agents: items.filter((i) => i.type === 'agent').length,
    },
    items,
  };
  writeFileSync(join(outDir, 'catalog.json'), JSON.stringify(payload));
  return payload.counts;
}

import { pathToFileURL } from 'node:url';

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const counts = buildCatalog();
  console.log(`website/catalog.json generated: ${counts.total} items (${counts.skills} skills, ${counts.rules} rules, ${counts.agents} agents)`);
}
