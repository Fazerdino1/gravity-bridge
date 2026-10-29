# ⚡ Gravity Bridge — Hub Communautaire Google Antigravity

[![Validate](https://github.com/Fazerdino1/gravity-bridge/actions/workflows/validate.yml/badge.svg)](https://github.com/Fazerdino1/gravity-bridge/actions/workflows/validate.yml)
[![Website](https://github.com/Fazerdino1/gravity-bridge/actions/workflows/pages.yml/badge.svg)](https://fazerdino1.github.io/gravity-bridge/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Resources: 862](https://img.shields.io/badge/Ressources_Antigravity-862-10b981.svg)](https://fazerdino1.github.io/gravity-bridge/#catalog)

[English](README.md) · **Français** · [Español](README.es.md) · [Deutsch](README.de.md) · [🌐 Site Web & Catalogue Interactif](https://fazerdino1.github.io/gravity-bridge/) · [Contribuer](CONTRIBUTING.fr.md) · [Code de conduite](CODE_OF_CONDUCT.fr.md)

Un hub communautaire open source (licence MIT) qui adapte, vérifie et documente **862 skills, règles, personas d'agents, collections et plugins installables** pour **Google Antigravity**, avec une attribution et une licence claires pour chaque élément.

---

## 🚀 Installation en 1 commande (CLI)

Installez n'importe quel skill, règle, collection ou plugin Antigravity directement dans votre projet (`.agents/`) ou dans votre configuration globale (`~/.gemini/`) :

```sh
# Installer un skill, une règle ou une persona dans <votre-projet>/.agents/
npx github:Fazerdino1/gravity-bridge add conventional-commit
npx github:Fazerdino1/gravity-bridge add markdown

# Installer toute une collection thématique d'un seul coup
npx github:Fazerdino1/gravity-bridge add --collection fullstack-web-typescript

# Installer un plugin Antigravity complet dans ~/.gemini/config/plugins/
npx github:Fazerdino1/gravity-bridge add --plugin git-and-docs-essentials

# Rechercher dans le catalogue depuis votre terminal
npx github:Fazerdino1/gravity-bridge list --search docker
```

---

## 📦 Aperçu du Catalogue (862 Ressources + 6 Plugins)

| Catégorie | Dossier | Nombre | Emplacement cible dans Antigravity |
|---|---|---:|---|
| **Skills** | [`skills/`](skills/) | **447** | `<projet>/.agents/skills/<nom>/SKILL.md` (invoqué via `/<nom>`) |
| **Règles** | [`rules/`](rules/) | **193** | `<projet>/.agents/rules/<nom>.md` (toutes garanties `< 24 Ko`) |
| **Personas d'agents** | [`agents/`](agents/) | **222** | `<projet>/.agents/skills/<nom>/SKILL.md` |
| **Collections** | [`collections/`](collections/) | **6** | Packs thématiques (`collections/*.yml`) |
| **Plugins Antigravity** | [`plugins/`](plugins/) | **6** | `~/.gemini/config/plugins/gravity-<id>/` |

---

## 🤝 Contribuer, Gouvernance & Attribution

- **Formulaires interactifs GitHub Issues** : [Proposer une ressource](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=new_resource.yml) · [Signaler un problème](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=conversion_problem.yml) · [Demande de retrait](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=license_or_removal_request.yml)
- **Guides** : [CONTRIBUTING.fr.md](CONTRIBUTING.fr.md) · [CODE_OF_CONDUCT.fr.md](CODE_OF_CONDUCT.fr.md) · [Audit de sécurité des scripts](docs/scripts-security-audit.md) · [NOTICE.md](NOTICE.md)
