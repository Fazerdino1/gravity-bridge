// Copilot → Antigravity mappers.
// TODO(verify): the source-side front matter keys (applyTo, mode/agent, tools, model, handoffs)
// and the rule `trigger`/`description` fields are based on docs/mapping.md and
// docs/antigravity-format.md. Anything not verified there is isolated in this file.

/** Front matter keys with no Antigravity equivalent; dropped and reported. */
const DROPPED_KEYS = ['mode', 'agent', 'tools', 'model', 'handoffs', 'target', 'mcp-servers', 'argument-hint'];

const GLOBAL_APPLY_TO = new Set(['**', '**/*', '*']);

function reportDropped(data, allowed) {
  const warnings = [];
  for (const key of Object.keys(data)) {
    if (allowed.includes(key)) continue;
    const known = DROPPED_KEYS.includes(key) ? 'no Antigravity equivalent' : 'unknown key';
    warnings.push(`dropped front matter key \`${key}\` (${known})`);
  }
  return warnings;
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function truncate(desc, max = 1024) {
  return desc.length > max ? `${desc.slice(0, max - 1)}…` : desc;
}

/** Copilot skill → Antigravity skill (same Agent Skills format). */
export function mapSkill({ name, data, body }) {
  const warnings = reportDropped(data, ['name', 'description', 'license', 'metadata', 'allowed-tools', 'compatibility']);
  if ('allowed-tools' in data) warnings.push('`allowed-tools` dropped: not documented for Antigravity (TODO(verify))');
  let description = text(data.description);
  const manual = [];
  if (!description) {
    description = `TODO: describe what the ${name} skill does and when to use it.`;
    manual.push('missing description');
  }
  if (text(data.name) && text(data.name) !== name) warnings.push(`source name \`${data.name}\` normalized to \`${name}\``);
  return {
    target: `skills/${name}/SKILL.md`,
    frontmatter: { name, description: truncate(description) },
    body,
    warnings,
    manual,
  };
}

/** Copilot instruction → Antigravity rule. */
export function mapInstruction({ name, data, body }) {
  const warnings = reportDropped(data, ['description', 'applyTo']);
  const applyTo = text(data.applyTo);
  const globs = applyTo ? applyTo.split(',').map((g) => g.trim()).filter(Boolean) : [];
  const isGlobal = globs.length === 0 || globs.every((g) => GLOBAL_APPLY_TO.has(g));
  const trigger = isGlobal ? 'always_on' : 'model_decision';
  let description = text(data.description) || `Coding guidelines converted from the Copilot instruction ${name}.`;
  let outBody = body;
  if (!isGlobal) {
    const list = globs.map((g) => `\`${g}\``).join(', ');
    outBody = `\nApply this rule when working on files matching: ${list}.\n${body.startsWith('\n') ? body : `\n${body}`}`;
    description = `${description.replace(/\.?$/, '.')} Applies to files matching ${globs.join(', ')}.`;
    warnings.push('`applyTo` restated in rule text (native glob trigger TODO(verify))');
  }
  const manual = [];
  if (Buffer.byteLength(outBody, 'utf8') > 23000) manual.push('rule close to or above the 24,000-byte limit');
  return {
    target: `rules/${name}.md`,
    frontmatter: { trigger, description: truncate(description) },
    body: outBody,
    warnings,
    manual,
  };
}

/** Copilot prompt → Antigravity skill (workflows are deprecated). */
export function mapPrompt({ name, data, body }) {
  const warnings = reportDropped(data, ['description', 'name', 'title']);
  const description = text(data.description) || `Task workflow converted from the Copilot prompt ${name}. Use when the user asks to run ${name}.`;
  const manual = [];
  const inputs = [...new Set([...body.matchAll(/\$\{input:([^}:]+)[^}]*\}/g)].map((m) => m[1]))];
  if (inputs.length) manual.push(`rewrite \${input:…} placeholders as "ask the user for": ${inputs.join(', ')}`);
  if (/\$\{(?:file|selection|selectedText|workspaceFolder)[^}]*\}/.test(body)) {
    manual.push('uses Copilot context variables (${file}, ${selection}, …) with no Antigravity equivalent');
  }
  return {
    target: `skills/${name}/SKILL.md`,
    frontmatter: { name, description: truncate(description) },
    body,
    warnings,
    manual,
  };
}

/** Copilot custom agent → persona skill. Always needs manual review. */
export function mapAgent({ name, data, body }) {
  const warnings = reportDropped(data, ['description', 'name']);
  const description = text(data.description) || `Persona converted from the Copilot agent ${name}.`;
  return {
    target: `agents/${name}/SKILL.md`,
    frontmatter: { name, description: truncate(description) },
    body,
    warnings,
    manual: ['agent persona: adapt role, tools and handoffs by hand'],
  };
}

export const MAPPERS = { skills: mapSkill, instructions: mapInstruction, prompts: mapPrompt, agents: mapAgent };
