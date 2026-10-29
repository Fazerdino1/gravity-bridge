# Changelog

All notable changes to **Gravity Bridge** are documented in this file.
This project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

## [0.2.0] - 2026-10-29

### Added
- **Full Catalog Conversion (862 / 862 items)**: Converted all 447 skills, 193 workspace rules, and 222 agent personas with full provenance (`source_url`, `source_path`, `source_commit`, `source_license`, `source_copyright`, `source_author`) and 862 attribution rows in `NOTICE.md`.
- **One-Command CLI Installer (`scripts/cli.js`)**: Install skills, rules, personas, curated collections, or Antigravity plugins via `npx github:Fazerdino1/gravity-bridge add ...`.
- **6 Curated Collections & 6 Antigravity Plugins (`collections/`, `plugins/`)**: `git-and-docs-essentials`, `fullstack-web-typescript`, `python-and-ai`, `devops-containers-cloud`, `security-and-auditing`, and `tdd-and-architecture`.
- **Automated Sanitizer & Rule Condenser (`scripts/sanitize.js`)**: Rewrote non-Antigravity paths/variables across resources and `references/*.md`, and condensed all 18 rules exceeding 24,000 bytes with full backups in `docs/rule-references/`.
- **Bundled Scripts Security Audit (`scripts/audit-scripts.js`)**: Audited all 92 bundled script files (`docs/scripts-security-audit.md`).
- **Multilingual Interactive Web Hub (`website/`)**: Searchable 862-item catalog in FR/EN/ES/DE with technology tag filters, multi-word search, persistent favorites (`⭐`), on-demand full Markdown `<dialog>` preview, `.md` download, light/dark mode toggle, and GitHub Pages deployment (`.github/workflows/pages.yml`).
- **Automated Weekly Upstream Sync (`.github/workflows/sync-upstream.yml`)** and `scripts/update-notice.js`.
- **Multilingual Governance Docs**: Translated `README`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, and `SECURITY` into French, Spanish, and German, plus workspace dogfooding via `AGENTS.md` and `.agents/`.

## [0.1.0] - 2026-10-28

### Added
- Initial repository structure, MIT community license, `NOTICE.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `docs/`.
- Core converter (`scripts/convert.js`), validator (`scripts/validate.js`), and project renamer (`scripts/rename.js`) with unit tests and pilot batch of 5 curated resources (`status: reviewed`).
