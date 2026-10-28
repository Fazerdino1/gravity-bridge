# Security policy

## Why this matters

Skills, rules and workflows are instructions for an AI agent. **A skill can make the agent run commands, edit files or call the network on the user's machine.** A malicious or careless resource is therefore a real security risk. For this reason every resource is read by a human before it is merged, and `npm run validate` flags secrets and dangerous commands.

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private vulnerability reporting: *Security* tab → *Report a vulnerability* on this repository.

Include: the affected file(s), what the resource can make an agent do, and steps to reproduce. We aim to acknowledge reports within 7 days.

## In scope

- Resources containing harmful commands, data exfiltration, hidden instructions or prompt injection
- Leaked secrets
- Vulnerabilities in `scripts/` (converter, validator, rename tool)

## Note on converted content

The converter treats source files as **inert data**: it never executes them. Text inside a source that tries to give orders to an agent is preserved as-is and flagged for review.
