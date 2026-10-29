# ⚡ Gravity Bridge — Google Antigravity Community Hub

[![Validate](https://github.com/Fazerdino1/gravity-bridge/actions/workflows/validate.yml/badge.svg)](https://github.com/Fazerdino1/gravity-bridge/actions/workflows/validate.yml)
[![Website](https://github.com/Fazerdino1/gravity-bridge/actions/workflows/pages.yml/badge.svg)](https://fazerdino1.github.io/gravity-bridge/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Resources: 862](https://img.shields.io/badge/Antigravity_Resources-862-10b981.svg)](https://fazerdino1.github.io/gravity-bridge/#catalog)

**Languages:** **English** · [Français](README.fr.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [🌐 Interactive Web Catalog](https://fazerdino1.github.io/gravity-bridge/)

An open-source community hub (MIT-licensed) that adapts, curates, and validates **862 skills, workspace rules, agent personas, collections, and installable plugins** for **Google Antigravity**, with full provenance and author attribution for every item.

---

## 🚀 One-Command CLI Installation

Install any skill, rule, collection, or full Antigravity plugin directly into your project (`.agents/`) or global config (`~/.gemini/`):

```sh
# Install a single skill, rule, or persona into <your-project>/.agents/
npx github:Fazerdino1/gravity-bridge add conventional-commit
npx github:Fazerdino1/gravity-bridge add markdown

# Install an entire curated collection at once
npx github:Fazerdino1/gravity-bridge add --collection fullstack-web-typescript

# Install a pre-built Antigravity Plugin into ~/.gemini/config/plugins/
npx github:Fazerdino1/gravity-bridge add --plugin git-and-docs-essentials

# Search the catalog from your terminal
npx github:Fazerdino1/gravity-bridge list --search docker
```

---

## 📦 Catalog Overview (862 Resources + 6 Plugins)

| Category | Folder | Count | Antigravity Target |
|---|---|---:|---|
| **Skills** | [`skills/`](skills/) | **447** | `<project>/.agents/skills/<name>/SKILL.md` (invoke via `/<name>`) |
| **Workspace Rules** | [`rules/`](rules/) | **193** | `<project>/.agents/rules/<name>.md` (all guaranteed `< 24 KB`) |
| **Agent Personas** | [`agents/`](agents/) | **222** | `<project>/.agents/skills/<name>/SKILL.md` |
| **Curated Collections** | [`collections/`](collections/) | **6** | Thematic bundles (`collections/*.yml`) |
| **Antigravity Plugins** | [`plugins/`](plugins/) | **6** | `~/.gemini/config/plugins/gravity-<id>/` |

### Featured Collections & Plugins

1. **`git-and-docs-essentials`** — Conventional Commits, README creation, code refactoring, CommonMark Markdown, and implementation plans (`status: reviewed`).
2. **`fullstack-web-typescript`** — Next.js, Tailwind, Node.js/Vitest, Playwright TypeScript, Vue.js, and Web Accessibility (`a11y`).
3. **`python-and-ai`** — LangChain Python, Pytest coverage, Playwright Python, and MCP servers.
4. **`devops-containers-cloud`** — Multi-stage Dockerfiles, Kubernetes manifests, GitHub Actions CI/CD, AWS & Azure architecture.
5. **`security-and-auditing`** — OWASP rules, prompt safety, MCP security audits, and SAST/SCA reviewers.
6. **`tdd-and-architecture`** — Red-Green-Refactor TDD cycle personas, API breaking-change detection, and system architecture.

---

## 🛠️ Tooling & Quality Scripts

| Command | Description |
|---|---|
| `npm run cli -- ...` | Run the CLI installer (`list`, `add <name>`, `add --collection <id>`, `add --plugin <id>`) |
| `npm run convert -- ...` | Convert resources from a local upstream clone with `--dry-run`, `--only`, `--type`, `--force` |
| `npm run sanitize` | Rewrite non-Antigravity paths/variables and condense any rule `> 24 KB` with full backup in `docs/rule-references/` |
| `npm run validate` | Validate front matter, provenance, licenses, `NOTICE.md` entries, secrets, and dangerous commands |
| `npm run audit:scripts` | Audit all 91 bundled `scripts/` inside skills and generate [`docs/scripts-security-audit.md`](docs/scripts-security-audit.md) |
| `npm run build:plugins` | Build installable Antigravity plugins (`plugins/gravity-*/`) from `collections/*.yml` |
| `npm run build:site` | Generate `website/catalog.json` (with technology tags and previews) for the web hub |

---

## 🤝 Contributing, Governance & Attribution

- **Interactive Issue Forms**: [Propose a Resource](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=new_resource.yml) · [Report a Problem](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=conversion_problem.yml) · [Removal Request](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=license_or_removal_request.yml)
- **Guides**: [CONTRIBUTING.md](CONTRIBUTING.md) ([FR](CONTRIBUTING.fr.md) · [ES](CONTRIBUTING.es.md) · [DE](CONTRIBUTING.de.md)) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) ([FR](CODE_OF_CONDUCT.fr.md) · [ES](CODE_OF_CONDUCT.es.md) · [DE](CODE_OF_CONDUCT.de.md))
- **Attribution**: Every converted item preserves its license and original author in YAML front matter and in [NOTICE.md](NOTICE.md).
