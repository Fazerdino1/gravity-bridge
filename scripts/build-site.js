#!/usr/bin/env node
// Build script for the Gravity Bridge website (website/catalog.json).
// Reads all skills, rules, agents, and collections in the repository, detects technology tags,
// includes a preview snippet, and writes a JSON index.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { parseFrontmatter } from './lib/frontmatter.js';

const IGNORED = new Set(['README.md', '.gitkeep']);

const TAG_RULES = [
  ['TypeScript / JS', /\b(typescript|javascript|nextjs|react|vue|angular|nodejs|vitest|playwright-typescript)\b/i],
  ['Python', /\b(python|pytest|django|fastapi|flask|pandas|langchain|jupyter)\b/i],
  ['.NET / C#', /\b(dotnet|csharp|aspnet|blazor|maui|winforms|bicep)\b/i],
  ['Java / Spring', /\b(java|spring|springboot|quarkus|maven|gradle|jpa)\b/i],
  ['DevOps & Cloud', /\b(docker|dockerfile|kubernetes|k8s|terraform|azure|aws|gcp|devops|github-actions|ci-cd)\b/i],
  ['Security', /\b(security|owasp|sast|auth|vulnerability|secret|audit)\b/i],
  ['Testing & QA', /\b(test|testing|tdd|playwright|coverage|qa|debug)\b/i],
  ['AI & Agents', /\b(mcp|agent|llm|prompt|rag|openai|gemini|architecture|plan)\b/i],
];

export function detectTags(name, description) {
  const hay = `${name} ${description}`;
  const tags = [];
  for (const [label, re] of TAG_RULES) {
    if (re.test(hay)) tags.push(label);
  }
  return tags;
}

export function buildCatalog(root = resolve('.')) {
  const items = [];

  for (const folder of ['skills', 'agents']) {
    const base = join(root, folder);
    for (const name of readdirSync(base).filter((n) => !IGNORED.has(n)).sort()) {
      const dir = join(base, name);
      if (!statSync(dir).isDirectory()) continue;
      const file = join(dir, 'SKILL.md');
      const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'));
      const description = String(data.description ?? '');
      items.push({
        type: folder === 'skills' ? 'skill' : 'agent',
        name,
        path: `${folder}/${name}/SKILL.md`,
        description,
        tags: detectTags(name, description),
        status: String(data.status ?? 'draft'),
        author: String(data.source_author ?? 'Community'),
        license: String(data.source_license ?? 'MIT'),
        preview: body.trim().slice(0, 1400),
      });
    }
  }

  const rulesBase = join(root, 'rules');
  for (const file of readdirSync(rulesBase).filter((n) => !IGNORED.has(n) && n.endsWith('.md')).sort()) {
    const name = file.slice(0, -3);
    const { data, body } = parseFrontmatter(readFileSync(join(rulesBase, file), 'utf8'));
    const description = String(data.description ?? '');
    items.push({
      type: 'rule',
      name,
      path: `rules/${file}`,
      trigger: String(data.trigger ?? 'model_decision'),
      description,
      tags: detectTags(name, description),
      status: String(data.status ?? 'draft'),
      author: String(data.source_author ?? 'Community'),
      license: String(data.source_license ?? 'MIT'),
      preview: body.trim().slice(0, 1400),
    });
  }

  const collections = [];
  const colBase = join(root, 'collections');
  for (const file of readdirSync(colBase).filter((n) => /\.ya?ml$/.test(n)).sort()) {
    const col = YAML.parse(readFileSync(join(colBase, file), 'utf8'));
    collections.push({
      id: col.id,
      name: col.name,
      description: col.description,
      pluginId: `gravity-${col.id}`,
      items: (col.items ?? []).map((i) => i.path),
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
      collections: collections.length,
    },
    collections,
    items,
  };
  writeFileSync(join(outDir, 'catalog.json'), JSON.stringify(payload));
  return payload.counts;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const counts = buildCatalog();
  console.log(
    `website/catalog.json generated: ${counts.total} items (${counts.skills} skills, ${counts.rules} rules, ${counts.agents} agents, ${counts.collections} collections)`,
  );
}
