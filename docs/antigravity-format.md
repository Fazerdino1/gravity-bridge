# Antigravity format reference

Last verified: 2026-10-28, against the Antigravity built-in customization docs (`agy-customizations` skill: `docs/skills.md`, `docs/rules.md`; `migrate-workflows` skill) and <https://antigravity.google/docs>.

Items marked **TODO(verify)** are assumptions that still need confirmation.

## Customization roots

| Scope | Location |
|---|---|
| Workspace | `<project>/.agents/` (current). `.agent/`, `_agents/`, `_agent/` are still discovered. |
| Global | `~/.gemini/skills/`, `~/.gemini/config/rules/*.md`, `~/.gemini/GEMINI.md`, `~/.gemini/AGENTS.md` |

This repository is a **catalog**: resources live at the root (`skills/`, `rules/`, …) and users copy them into one of the roots above.

## Skills — verified

```text
skills/<name>/
├── SKILL.md       # required
├── scripts/       # optional
├── examples/      # optional
├── resources/     # optional
└── references/    # optional
```

`SKILL.md` front matter:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | lowercase, hyphenated, unique |
| `description` | yes | what + when; max 1024 characters |

Skills are progressively disclosed (only name + description are loaded up front) and can be invoked as `/<name>`.

## Rules — partly verified

- Location: `.agents/rules/*.md` (verified). Markdown.
- Per-file limit: 24,000 bytes (verified).
- `trigger: always_on` and `trigger: model_decision` exist (verified).
- `description` field used with `model_decision` — **TODO(verify)** exact field name.
- Glob-based trigger (e.g. `trigger: glob` + `globs:`) — **TODO(verify)**; not used by the converter.

## Workflows — deprecated

`.agents/workflows/*.md` are deprecated in favour of skills (verified, `migrate-workflows`). Gravity Bridge converts Copilot prompts into skills.

## Provenance fields (project convention)

Added to the front matter of every converted item:

`source_url`, `source_path`, `source_commit`, `source_license`, `source_copyright`, `source_author` (optional), `converted_at`, `converter_version`, `status` (`draft` | `reviewed` | `tested`).

Whether Antigravity ignores unknown front matter keys is **TODO(verify)** (expected, untested).
