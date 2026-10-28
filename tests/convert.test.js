import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { convert, renderReport } from '../scripts/lib/converter.js';
import { parseFrontmatter } from '../scripts/lib/frontmatter.js';

const FIXTURES = fileURLToPath(new URL('./fixtures/', import.meta.url));
const SOURCE = join(FIXTURES, 'source');
const UNLICENSED = join(FIXTURES, 'unlicensed-source');
const COMMIT = '0123456789abcdef0123456789abcdef01234567';
const NOW = new Date('2026-01-01T00:00:00Z');

const temps = [];
function tempOut() {
  const dir = mkdtempSync(join(tmpdir(), 'gb-convert-'));
  temps.push(dir);
  return dir;
}
after(() => temps.forEach((d) => rmSync(d, { recursive: true, force: true })));

const run = (out, extra = {}) => convert({ source: SOURCE, out, commit: COMMIT, now: NOW, ...extra });
const read = (out, rel) => parseFrontmatter(readFileSync(join(out, rel), 'utf8'));

describe('convert', () => {
  it('converts a valid skill with full provenance and copies extra files', () => {
    const out = tempOut();
    run(out, { only: ['valid-skill'] });
    const { data, body } = read(out, 'skills/valid-skill/SKILL.md');
    assert.equal(data.name, 'valid-skill');
    assert.match(data.description, /changelog/i);
    assert.equal(data.source_url, 'https://github.com/github/awesome-copilot');
    assert.equal(data.source_path, 'skills/valid-skill/SKILL.md');
    assert.equal(data.source_commit, COMMIT);
    assert.equal(data.source_license, 'MIT');
    assert.equal(data.source_copyright, 'Copyright (c) Fixture Authors');
    assert.equal(data.status, 'draft');
    assert.equal(data.converter_version, '0.1.0');
    assert.equal(data.converted_at, NOW.toISOString());
    assert.equal(data.license, undefined, 'Copilot-only license key is replaced by source_license');
    assert.match(body, /# Valid skill/);
    assert.ok(existsSync(join(out, 'skills/valid-skill/references/style.md')));
  });

  it('refuses an item without a license', () => {
    const out = tempOut();
    const result = convert({ source: UNLICENSED, out, commit: COMMIT, now: NOW });
    assert.equal(result.converted.length, 0);
    assert.equal(result.skipped.length, 1);
    assert.match(result.skipped[0].reason, /no license/);
    assert.ok(!existsSync(join(out, 'skills/no-license-skill')));
  });

  it('converts an instruction with applyTo into a model_decision rule', () => {
    const out = tempOut();
    run(out, { types: ['instructions'] });
    const ts = read(out, 'rules/typescript-style.md');
    assert.equal(ts.data.trigger, 'model_decision');
    assert.match(ts.body, /Apply this rule when working on files matching: `\*\*\/\*\.ts`, `\*\*\/\*\.tsx`\./);
    assert.match(ts.data.description, /\*\*\/\*\.ts/);
    assert.equal(ts.data.applyTo, undefined);
    const general = read(out, 'rules/general.md');
    assert.equal(general.data.trigger, 'always_on');
    assert.ok(general.data.description);
  });

  it('converts a prompt into a skill and reports input placeholders', () => {
    const out = tempOut();
    const result = run(out, { types: ['prompts'] });
    const { data, body } = read(out, 'skills/write-tests/SKILL.md');
    assert.equal(data.name, 'write-tests');
    assert.equal(data.mode, undefined);
    assert.equal(data.tools, undefined);
    assert.match(body, /\$\{input:module:Module path\}/);
    const rec = result.converted[0];
    assert.ok(rec.warnings.some((w) => w.includes('`mode`')));
    assert.ok(rec.manual.some((m) => m.includes('module')));
  });

  it('converts an agent into a persona skill flagged for manual review', () => {
    const out = tempOut();
    const result = run(out, { types: ['agents'] });
    const { data } = read(out, 'agents/code-reviewer/SKILL.md');
    assert.equal(data.name, 'code-reviewer');
    assert.equal(data.model, undefined);
    assert.equal(result.manual.length, 1);
  });

  it('treats prompt injection as inert data and flags it', () => {
    const out = tempOut();
    const sourceText = readFileSync(join(SOURCE, 'skills/injected-skill/SKILL.md'), 'utf8');
    const result = run(out, { only: ['injected-skill'] });
    const { body } = read(out, 'skills/injected-skill/SKILL.md');
    assert.ok(sourceText.endsWith(body.trimStart()), 'body is copied verbatim');
    assert.ok(!existsSync(join(out, 'PWNED')) && !existsSync('PWNED'), 'nothing was executed');
    const flags = result.manual[0].manual.join('\n');
    assert.match(flags, /ignore previous instructions/);
    assert.match(flags, /exfiltration/);
  });

  it('is idempotent and preserves reviewed items', () => {
    const out = tempOut();
    run(out);
    const second = convert({ source: SOURCE, out, commit: COMMIT, now: new Date('2027-01-01T00:00:00Z') });
    assert.equal(second.converted.length, 0);
    assert.equal(second.unchanged.length, 6);

    const file = join(out, 'rules/general.md');
    const edited = readFileSync(file, 'utf8').replace('status: draft', 'status: reviewed').replace('Write clear', 'Write very clear');
    writeFileSync(file, edited);
    const third = run(out, { only: ['general'] });
    assert.match(third.skipped[0].reason, /reviewed/);
    assert.equal(readFileSync(file, 'utf8'), edited);

    const forced = run(out, { only: ['general'], force: true });
    assert.equal(forced.converted.length, 1);
    assert.match(readFileSync(file, 'utf8'), /status: draft/);
  });

  it('writes nothing in dry-run mode and renders a report', () => {
    const out = tempOut();
    const result = run(out, { dryRun: true });
    assert.equal(result.converted.length, 6);
    assert.match(result.skipped.find((s) => s.name === 'apache-declared').reason, /declared license "Apache-2.0"/);
    assert.ok(!existsSync(join(out, 'skills')) && !existsSync(join(out, 'rules')));
    const report = renderReport(result);
    assert.match(report, /dry run/);
    assert.match(report, /## Suggested NOTICE.md rows/);
  });

  it('rejects a missing source directory', () => {
    assert.throws(() => convert({ source: join(FIXTURES, 'nope'), out: tempOut() }), /source directory not found/);
  });
});
