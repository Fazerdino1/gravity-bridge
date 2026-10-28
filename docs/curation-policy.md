# Curation policy

Gravity Bridge favours a small, trustworthy catalog over a large one.

## Acceptance criteria

A resource is accepted only if it is:

1. **Useful** — solves a real, recurring task for Antigravity users.
2. **Clear** — the description states what it does and when to use it; the body is readable.
3. **Tested** — or explicitly marked `status: draft` until someone tests it.
4. **Licensed** — explicit license allowing redistribution; copyright line copied verbatim into `NOTICE.md`.
5. **Safe** — no destructive commands without explicit user confirmation, no data exfiltration (uploading files, environment variables or credentials), no hidden or obfuscated instructions.
6. **Secret-free** — no API keys, tokens, passwords or personal data.

## Rejection criteria

- No license, unclear license, or a license that forbids redistribution
- Prompt injection or instructions aimed at subverting the agent or the user
- Commands such as `rm -rf` on broad paths, `curl … | sh`, `sudo`, or writes outside the project, without justification and user confirmation
- Duplicates of an existing resource without clear improvement
- Copilot-only features with no Antigravity meaning (hooks, plugins, MCP installer)
- Resources that mainly promote a product or service

## Status levels

| Status | Meaning | Who sets it |
|---|---|---|
| `draft` | Converted automatically or freshly written; not yet reviewed | Converter / contributor |
| `reviewed` | A maintainer has read the full text and approved it | Maintainer |
| `tested` | Verified to work in Antigravity (version and date noted in the PR) | Maintainer |

The converter never overwrites a `reviewed` or `tested` item unless run with `--force`.
