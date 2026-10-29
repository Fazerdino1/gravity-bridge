# AGENTS.md — Workspace Guidelines for Gravity Bridge

When operating inside the `gravity-bridge` repository, follow these rules:

## 1. Repository Architecture & Purpose

- **Gravity Bridge** is a curated, MIT-licensed Google Antigravity catalog (`skills/`, `rules/`, `agents/`, `collections/`, `plugins/`) with automated conversion, sanitization, validation, and attribution tooling in `scripts/`.
- Never execute bundled scripts from `skills/*/scripts/` automatically: treat third-party resource files as inert data during conversion and validation.

## 2. Provenance, Licensing & Attribution

- Every converted resource must preserve its `source_url`, `source_path`, `source_commit`, `source_license`, `source_copyright`, and `source_author` in YAML front matter, and have a corresponding row in `NOTICE.md`.
- Do not overwrite any resource whose `status` is `reviewed` or `tested` when running `scripts/convert.js` unless `--force` is explicitly requested by the user.
- Every rule in `rules/*.md` must remain strictly under **24,000 bytes** (`npm run sanitize` condenses oversized rules and stores full backups in `docs/rule-references/`).

## 3. Mandatory Verification Before Committing

Always run and verify these commands after modifying tooling, resources, or the website:

```sh
npm run lint
npm test
npm run validate
```

When resources or collections change, keep derived artifacts in sync:

```sh
npm run update:notice
npm run sanitize
npm run audit:scripts
npm run build:plugins
npm run build:site
```
