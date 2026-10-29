# Contributing to Gravity Bridge

**Languages:** **English** · [Français](CONTRIBUTING.fr.md) · [Español](CONTRIBUTING.es.md) · [Deutsch](CONTRIBUTING.de.md) · [🌐 Web Guide](https://fazerdino1.github.io/gravity-bridge/#contributing)

Thanks for helping! This project values **quality over quantity**: every Google Antigravity resource is curated, documented, and properly attributed.

## Ways to contribute

> **Note:** Click the links below to open the interactive **GitHub Issue Forms** (rather than viewing the raw `.yml` template files in the repository tree):

- **Propose a resource**: [Open a New Resource Issue](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=new_resource.yml) or open a pull request.
- **Report a conversion or resource problem**: [Open a Conversion Problem Issue](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=conversion_problem.yml).
- **Report a bug in the tooling**: [Open a Bug Report](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=bug_report.yml).
- **Improve the tooling** (`scripts/`): bug fixes and tests are welcome.

## Adding or updating an Antigravity resource

### Option A — Author a native Antigravity resource directly

1. Create your skill in `skills/<name>/SKILL.md`, rule in `rules/<name>.md`, or agent persona in `agents/<name>/SKILL.md` following the [Antigravity format reference](docs/antigravity-format.md).
2. Set `status: draft` (or `reviewed` once checked by a maintainer).
3. Run `npm run lint && npm test && npm run validate`.

### Option B — Convert an external resource with the converter

1. Run a dry run against your local source directory, then the real conversion:
   ```sh
   npm run convert -- --source <path-to-source-repo> --out . --only <name> --dry-run
   npm run convert -- --source <path-to-source-repo> --out . --only <name>
   ```
2. Read the generated resource and `conversion-report.md`, and adapt any non-Antigravity wording.
3. Ensure the attribution row is present in [NOTICE.md](NOTICE.md).
4. Run `npm run lint && npm test && npm run validate`.

See [docs/conversion-guide.md](docs/conversion-guide.md) for details.

## Pull request checklist

- **Note:** When you open a Pull Request on GitHub, these checkboxes become interactive in your PR description:
- Source URL, original path and commit are recorded (for converted items)
- Author is credited (when known)
- License is explicit and allows redistribution; copyright line copied verbatim into `NOTICE.md`
- Tested in Google Antigravity (say how), or left as `status: draft`
- No secrets, no data exfiltration, dangerous commands justified
- `npm run validate` passes

## Naming conventions

- Files and folders: lowercase, hyphen-separated (`my-skill`, `typescript-style.md`).
- Skill `name` equals its folder name.
- Commits follow [Conventional Commits](https://fazerdino1.github.io/gravity-bridge/#contributing) (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`).

## Review process

1. CI runs lint, tests and validation.
2. A maintainer reads the full resource text (skills and rules can guide an agent to run commands on users' machines).
3. Status moves from `draft` → `reviewed` (read and approved) → `tested` (verified in Antigravity). See [docs/curation-policy.md](docs/curation-policy.md).

## Removal requests

If you are the author of a source item and want it removed or re-attributed, [open a License or Removal Request](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=license_or_removal_request.yml) or email [fazerdinotheck@outlook.fr](mailto:fazerdinotheck@outlook.fr). We act on legitimate requests promptly, with no debate required.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md) ([Français](CODE_OF_CONDUCT.fr.md) · [Español](CODE_OF_CONDUCT.es.md) · [Deutsch](CODE_OF_CONDUCT.de.md)).
