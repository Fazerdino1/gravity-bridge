# Contributing to Gravity Bridge

Thanks for helping! This project values **quality over quantity**: every resource is curated, documented and correctly attributed.

## Ways to contribute

- **Propose a resource**: open a [New resource](.github/ISSUE_TEMPLATE/new_resource.yml) issue, or a pull request.
- **Report a conversion problem**: use the [Conversion problem](.github/ISSUE_TEMPLATE/conversion_problem.yml) template.
- **Improve the tooling** (`scripts/`): bug fixes and tests are welcome.

## Adding a converted resource

1. Clone [github/awesome-copilot](https://github.com/github/awesome-copilot) locally.
2. Run a dry run, then the real conversion:
   ```sh
   npm run convert -- --source ../awesome-copilot --out . --only <name> --dry-run
   npm run convert -- --source ../awesome-copilot --out . --only <name>
   ```
3. Read the output and `conversion-report.md`, fix anything flagged for manual review.
4. Add a row to [NOTICE.md](NOTICE.md).
5. Run `npm run lint && npm test && npm run validate`.

See [docs/conversion-guide.md](docs/conversion-guide.md) for details.

## Pull request checklist

- [ ] Source URL, original path and commit are recorded
- [ ] Author is credited (when known)
- [ ] License is explicit and allows redistribution; copyright line copied verbatim into `NOTICE.md`
- [ ] Tested in Antigravity (say how), or left as `status: draft`
- [ ] No secrets, no data exfiltration, dangerous commands justified
- [ ] `npm run validate` passes

## Naming conventions

- Files and folders: lowercase, hyphen-separated (`my-skill`, `typescript-style.md`).
- Skill `name` equals its folder name.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`).

## Review process

1. CI runs lint, tests and validation.
2. A maintainer reads the full resource text (skills and workflows can run commands on users' machines).
3. Status moves from `draft` → `reviewed` (read and approved) → `tested` (verified in Antigravity). See [docs/curation-policy.md](docs/curation-policy.md).

## Removal requests

If you are the author of a source item and want it removed or re-attributed, open a [License or removal request](.github/ISSUE_TEMPLATE/license_or_removal_request.yml). We act on legitimate requests promptly, with no debate required.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
