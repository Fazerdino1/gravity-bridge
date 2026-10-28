# Skills

Antigravity skills. One directory per skill: `skills/<name>/SKILL.md` (lowercase, hyphenated `<name>`).

`SKILL.md` starts with YAML front matter containing `name` (must equal the directory name) and `description` (what the skill does and when to use it, max 1024 chars), followed by provenance fields (see [docs/antigravity-format.md](../docs/antigravity-format.md)). Optional sub-folders: `scripts/`, `examples/`, `resources/`, `references/`.

Converted Copilot **prompts** (`*.prompt.md`) also land here, because Antigravity workflows are deprecated in favour of skills.

To use a skill, copy its folder into `<your-project>/.agents/skills/` (workspace) or `~/.gemini/skills/` (global).
