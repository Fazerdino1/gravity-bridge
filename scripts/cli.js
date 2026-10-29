#!/usr/bin/env node
// Improvement #4: Interactive / one-command CLI installer for Gravity Bridge resources.
// Usage:
//   node scripts/cli.js list [--type skill|rule|agent|collection] [--search <query>]
//   node scripts/cli.js add <name> [--dest .] [--global]
//   node scripts/cli.js add --collection <id> [--dest .]
//   node scripts/cli.js add --plugin <id>
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IGNORED = new Set(['README.md', '.gitkeep']);

const HELP = `Gravity Bridge CLI — Install Google Antigravity skills, rules, personas, collections & plugins

Usage:
  npx gravity-bridge list [--type skill|rule|agent|collection] [--search <keyword>]
  npx gravity-bridge add <resource-name> [--dest <project-dir>] [--global]
  npx gravity-bridge add --collection <collection-id> [--dest <project-dir>]
  npx gravity-bridge add --plugin <collection-id>

Examples:
  npx gravity-bridge list --search docker
  npx gravity-bridge add conventional-commit
  npx gravity-bridge add markdown --dest ./my-app
  npx gravity-bridge add --collection fullstack-web-typescript
  npx gravity-bridge add --plugin git-and-docs-essentials`;

export function findResource(name, root = REPO_ROOT) {
  const skillDir = join(root, 'skills', name);
  if (existsSync(join(skillDir, 'SKILL.md'))) return { type: 'skill', name, src: skillDir };
  const agentDir = join(root, 'agents', name);
  if (existsSync(join(agentDir, 'SKILL.md'))) return { type: 'agent', name, src: agentDir };
  const ruleFile = join(root, 'rules', name.endsWith('.md') ? name : `${name}.md`);
  if (existsSync(ruleFile)) return { type: 'rule', name: basename(ruleFile, '.md'), src: ruleFile };
  return null;
}

export function installResource(res, { dest = '.', global = false } = {}) {
  if (res.type === 'rule') {
    const targetDir = global ? join(homedir(), '.gemini', 'config', 'rules') : join(resolve(dest), '.agents', 'rules');
    mkdirSync(targetDir, { recursive: true });
    const targetFile = join(targetDir, `${res.name}.md`);
    cpSync(res.src, targetFile);
    return targetFile;
  }
  const targetDir = global
    ? join(homedir(), '.gemini', 'skills', res.name)
    : join(resolve(dest), '.agents', 'skills', res.name);
  mkdirSync(targetDir, { recursive: true });
  cpSync(res.src, targetDir, { recursive: true });
  return targetDir;
}

export function runCli(argv = process.argv.slice(2), root = REPO_ROOT) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      type: { type: 'string' },
      search: { type: 'string' },
      dest: { type: 'string', default: '.' },
      global: { type: 'boolean', default: false },
      collection: { type: 'string' },
      plugin: { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  const cmd = positionals[0];
  if (values.help || !cmd) {
    console.log(HELP);
    return 0;
  }

  if (cmd === 'list') {
    const q = (values.search ?? '').toLowerCase();
    const results = [];
    if (!values.type || values.type === 'skill') {
      for (const n of readdirSync(join(root, 'skills')).filter((x) => !IGNORED.has(x))) {
        if (!q || n.includes(q)) results.push(`skill       ${n}`);
      }
    }
    if (!values.type || values.type === 'rule') {
      for (const n of readdirSync(join(root, 'rules')).filter((x) => !IGNORED.has(x) && x.endsWith('.md'))) {
        const slug = n.slice(0, -3);
        if (!q || slug.includes(q)) results.push(`rule        ${slug}`);
      }
    }
    if (!values.type || values.type === 'agent') {
      for (const n of readdirSync(join(root, 'agents')).filter((x) => !IGNORED.has(x))) {
        if (!q || n.includes(q)) results.push(`agent       ${n}`);
      }
    }
    if (!values.type || values.type === 'collection') {
      for (const n of readdirSync(join(root, 'collections')).filter((x) => /\.ya?ml$/.test(x))) {
        const slug = n.replace(/\.ya?ml$/, '');
        if (!q || slug.includes(q)) results.push(`collection  ${slug}`);
      }
    }
    console.log(results.join('\n'));
    console.log(`\nTotal matching: ${results.length}`);
    return 0;
  }

  if (cmd === 'add') {
    if (values.plugin) {
      const id = values.plugin.startsWith('gravity-') ? values.plugin : `gravity-${values.plugin}`;
      const srcPlugin = join(root, 'plugins', id);
      if (!existsSync(srcPlugin)) {
        console.error(`Plugin not found: ${id}`);
        return 1;
      }
      const target = join(homedir(), '.gemini', 'config', 'plugins', id);
      mkdirSync(target, { recursive: true });
      cpSync(srcPlugin, target, { recursive: true });
      console.log(`Installed plugin ${id} → ${target} (restart Antigravity to activate)`);
      return 0;
    }

    if (values.collection) {
      const colFile = join(root, 'collections', `${values.collection.replace(/\.ya?ml$/, '')}.yml`);
      if (!existsSync(colFile)) {
        console.error(`Collection not found: ${values.collection}`);
        return 1;
      }
      const col = YAML.parse(readFileSync(colFile, 'utf8'));
      const installed = [];
      for (const item of col.items ?? []) {
        const name = basename(item.path, '.md');
        const res = findResource(name, root);
        if (res) installed.push(installResource(res, { dest: values.dest, global: values.global }));
      }
      console.log(`Installed collection "${col.name}" (${installed.length} items):`);
      for (const p of installed) console.log(`  ✔ ${p}`);
      return 0;
    }

    const targetName = positionals[1];
    if (!targetName) {
      console.error('Please specify a resource name, --collection <id>, or --plugin <id>.');
      return 1;
    }
    const res = findResource(targetName, root);
    if (!res) {
      console.error(`Resource not found: ${targetName}`);
      return 1;
    }
    const outPath = installResource(res, { dest: values.dest, global: values.global });
    console.log(`Installed ${res.type} "${res.name}" → ${outPath}`);
    return 0;
  }

  console.error(`Unknown command: ${cmd}\n\n${HELP}`);
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = runCli();
}
