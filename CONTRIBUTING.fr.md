# Contribuer à Gravity Bridge

**Langues :** [English](CONTRIBUTING.md) · **Français** · [Español](CONTRIBUTING.es.md) · [Deutsch](CONTRIBUTING.de.md) · [🌐 Guide Web](https://fazerdino1.github.io/gravity-bridge/#contributing)

Merci pour votre aide ! Ce projet privilégie **la qualité à la quantité** : chaque ressource pour Google Antigravity est vérifiée, documentée et correctement attribuée.

## Comment contribuer

> **Note :** Cliquez sur les liens ci-dessous pour ouvrir les **formulaires interactifs GitHub Issues** (au lieu de visualiser le fichier `.yml` brut dans l'arborescence du dépôt, où les menus déroulants sont en mode aperçu inactif) :

- **Proposer une ressource** : [Ouvrir une demande de nouvelle ressource](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=new_resource.yml) ou soumettre une Pull Request.
- **Signaler un problème sur une ressource ou une conversion** : [Ouvrir un ticket de problème de conversion](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=conversion_problem.yml).
- **Signaler un bug dans les outils** : [Ouvrir un rapport de bug](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=bug_report.yml).
- **Améliorer les scripts** (`scripts/`) : les correctifs et tests sont les bienvenus.

## Ajouter ou mettre à jour une ressource Antigravity

### Option A — Créer directement une ressource native Antigravity

1. Créez votre skill dans `skills/<nom>/SKILL.md`, votre règle dans `rules/<nom>.md`, ou votre persona d'agent dans `agents/<nom>/SKILL.md` en suivant la [référence du format Antigravity](docs/antigravity-format.md).
2. Définissez `status: draft` (ou `reviewed` après relecture).
3. Lancez `npm run lint && npm test && npm run validate`.

### Option B — Convertir une ressource externe avec l'outil de conversion

1. Lancez un test à blanc (`--dry-run`) sur votre dossier source local, puis la conversion réelle :
   ```sh
   npm run convert -- --source <chemin-du-depot-source> --out . --only <nom> --dry-run
   npm run convert -- --source <chemin-du-depot-source> --out . --only <nom>
   ```
2. Relisez le fichier généré et `conversion-report.md`, et adaptez tout terme non spécifique à Antigravity.
3. Vérifiez que la ligne d'attribution figure dans [NOTICE.md](NOTICE.md).
4. Lancez `npm run lint && npm test && npm run validate`.

Voir [docs/conversion-guide.md](docs/conversion-guide.md) pour plus de détails.

## Liste de contrôle pour les Pull Requests

- **Note :** Lorsque vous ouvrez une Pull Request sur GitHub, ces cases deviennent cochables dans votre description de PR :
- L'URL source, le chemin d'origine et le commit sont renseignés (pour les éléments convertis)
- L'auteur est crédité (s'il est connu)
- La licence est explicite et autorise la redistribution ; la ligne de copyright est copiée telle quelle dans `NOTICE.md`
- Testé dans Google Antigravity (préciser comment), ou laissé en `status: draft`
- Aucun secret, aucune exfiltration de données, commandes sensibles justifiées
- `npm run validate` passe sans erreur

## Conventions de nommage

- Fichiers et dossiers : minuscules, séparés par des tirets (`mon-skill`, `typescript-style.md`).
- Le champ `name` d'un skill est identique au nom de son dossier.
- Les commits suivent le format [Conventional Commits](https://fazerdino1.github.io/gravity-bridge/#contributing) (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`).

## Processus de relecture

1. La CI exécute le linter, les tests et la validation.
2. Un mainteneur relit l'intégralité du texte de la ressource (les skills et règles peuvent guider un agent pour exécuter des commandes sur la machine de l'utilisateur).
3. Le statut passe de `draft` → `reviewed` (relu et approuvé) → `tested` (vérifié dans Antigravity). Voir [docs/curation-policy.md](docs/curation-policy.md).

## Demandes de retrait ou d'attribution

Si vous êtes l'auteur d'un élément source et souhaitez son retrait ou une correction d'attribution, [ouvrez une demande de licence ou de retrait](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=license_or_removal_request.yml) ou écrivez à [fazerdinotheck@outlook.fr](mailto:fazerdinotheck@outlook.fr). Nous traitons les demandes légitimes rapidement et sans débat.

## Code de conduite

En participant, vous acceptez le [Code de conduite](CODE_OF_CONDUCT.fr.md) ([English](CODE_OF_CONDUCT.md) · [Español](CODE_OF_CONDUCT.es.md) · [Deutsch](CODE_OF_CONDUCT.de.md)).
