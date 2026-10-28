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

## Source-side assumptions — TODO(verify) against the local clone

- Folder names `skills/`, `instructions/`, `prompts/`, `agents/` at the repository root.
- Front matter keys: `applyTo` (instructions), `mode`/`agent`/`tools`/`model` (prompts), `tools`/`model` (agents).
