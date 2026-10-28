# Copilot → Antigravity mapping

| GitHub Copilot (awesome-copilot) | Gravity Bridge output | Status |
|---|---|---|
| `skills/<name>/SKILL.md` (+ files) | `skills/<name>/SKILL.md` (+ files copied as data) | Format verified on both sides (Agent Skills) |
| `instructions/<name>.instructions.md` | `rules/<name>.md` | Partly verified — see below |
| `prompts/<name>.prompt.md` | `skills/<name>/SKILL.md` | Target verified; chosen because workflows are deprecated |
| `agents/<name>.agent.md` | `agents/<name>/SKILL.md` (persona skill) | Case-by-case adaptation, always manual review |
| collections | `collections/<name>.yml` | TODO(verify): source may now use `plugins/` instead |
| hooks, plugins, MCP installer | not converted | Copilot-specific |

## Instructions → rules

- `applyTo` absent, `**` or `**/*` → `trigger: always_on`.
- Any other `applyTo` → `trigger: model_decision`, with a sentence at the top of the body: *"Apply this rule when working on files matching: `<globs>`."*
- TODO(verify): a native glob trigger would be more precise if Antigravity supports it.

## Prompts → skills

- `description` kept; a fallback is generated if missing.
- `mode` / `agent`, `tools`, `model` are dropped and reported (no Antigravity equivalent). TODO(verify) exact source key names.
- `${input:var}` placeholders are kept and reported: the reviewer should rewrite them as "ask the user for …".

## Agents → persona skills

- `description` kept; `tools`, `model`, `handoffs` dropped and reported.
- Always listed under "manual review" in the report.

## Source-side facts — verified against awesome-copilot `0fe6545b950671641b2b14b44eb56678fea6c6b4` (2026-10-28)

- Root folders: `skills/` (447), `instructions/` (193), `agents/` (222), `plugins/`, `hooks/`, `extensions/`, `workflows/`.
- **No `prompts/` folder**: prompts were migrated upstream to skills (commits `c10cb99a`, `f96a900e`). The prompt mapper is kept for older clones and forks.
- **No `collections/` folder**: replaced upstream by `plugins/` (commit `6ecd0098`). Collections are curated by hand here.
- Front matter keys seen — instructions: `applyTo`, `description`, `name`, `title`, `excludeAgent`; agents: `name`, `description`, `tools`, `model`, `mode`, `agent(s)`, `argument-hint`, `mcp-servers`, `handoffs`, `user-invocable`, `disable-model-invocation`, `hidden`, `target`; skills: `name`, `description`, `license`, `metadata`, `compatibility`, `allowed-tools`, `argument-hint`, `user-invocable`, …
- Licensing: root `LICENSE` is MIT (`Copyright GitHub, Inc.`). 60 skills declare `license:` in front matter (MIT, Apache-2.0, "Complete terms in LICENSE.txt"); several ship their own `LICENSE`/`LICENSE.txt`. The converter uses the nearest license file and refuses items whose declared SPDX license differs from it.
