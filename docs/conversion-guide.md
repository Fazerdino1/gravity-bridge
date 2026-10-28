# Conversion guide

## Prerequisites

- Node.js ≥ 20, `npm ci`
- A local clone of <https://github.com/github/awesome-copilot> (the converter never downloads anything)

## Usage

```sh
node scripts/convert.js --source <path-to-awesome-copilot> --out . \
  [--type skills|instructions|prompts|agents] [--only <name>] [--dry-run] [--force]
```

| Option | Meaning |
|---|---|
| `--source` | Local clone of awesome-copilot (required) |
| `--out` | Repository root to write into (default `.`) |
| `--type` | Limit to one source type (repeatable) |
| `--only` | Convert only the item(s) with this name (repeatable) |
| `--dry-run` | Show what would happen; write nothing |
| `--force` | Overwrite items whose status is `reviewed` or `tested` |
| `--source-url` | Source repository URL (default `https://github.com/github/awesome-copilot`) |
| `--commit` | Override the source commit (default: `git rev-parse HEAD` in the clone) |

## What the converter does

1. Finds source files by type and reads their front matter and body as plain text.
2. Resolves the license: a `LICENSE*` file in the item's folder, then the repository's `LICENSE`. **No license → refused.** Licenses outside the allow-list → refused.
3. Applies the mapping in [mapping.md](mapping.md).
4. Adds provenance fields and `status: draft`.
5. Flags instruction-like text ("ignore previous instructions", …), secrets and dangerous commands for manual review. **Source content is never executed.**
6. Writes `conversion-report.md` (converted, skipped with reason, manual review, warnings, suggested `NOTICE.md` rows). Dry runs print the report instead.

## Idempotence

Running the converter twice produces no change. Items with `status: reviewed` or `tested` are never overwritten without `--force`.

## After converting

1. Read every converted file.
2. Add the suggested rows to `NOTICE.md`.
3. `npm run validate`.
