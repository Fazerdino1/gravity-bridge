import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { detectTags } from '../scripts/build-site.js';
import { findResource, installResource } from '../scripts/cli.js';
import { sanitizeContent } from '../scripts/sanitize.js';

const temps = [];
function tempDir() {
  const d = mkdtempSync(join(tmpdir(), 'gb-cli-'));
  temps.push(d);
  return d;
}
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('sanitizeContent', () => {
  it('replaces Copilot paths, variables, and product names with Antigravity equivalents', () => {
    const input = 'Read .github/copilot-instructions.md and .github/instructions/ts.instructions.md with ${input:pkg:Package} in GitHub Copilot.';
    const { out, changed } = sanitizeContent(input);
    assert.equal(changed, true);
    assert.equal(out, 'Read GEMINI.md (or AGENTS.md) and .agents/rules/ts.md with <pkg: Package> in Google Antigravity.');
  });
});

describe('CLI & tags', () => {
  it('finds and installs a skill and a rule into a target workspace .agents/ folder', () => {
    const dest = tempDir();
    const skill = findResource('conventional-commit');
    assert.equal(skill?.type, 'skill');
    const installedSkill = installResource(skill, { dest });
    assert.ok(existsSync(join(installedSkill, 'SKILL.md')));

    const rule = findResource('markdown');
    assert.equal(rule?.type, 'rule');
    const installedRule = installResource(rule, { dest });
    assert.ok(existsSync(installedRule));
  });

  it('detects technology tags from name and description', () => {
    const tags = detectTags('playwright-typescript', 'End-to-end testing in TypeScript and React');
    assert.ok(tags.includes('TypeScript / JS'));
    assert.ok(tags.includes('Testing & QA'));
  });
});
