# Rules

Antigravity rules: one Markdown file per rule, `rules/<name>.md`.

Front matter: `trigger` (`always_on` or `model_decision`), `description`, plus provenance fields. Each file must stay under 24,000 bytes. Converted from Copilot `*.instructions.md`; the original `applyTo` glob is restated in the rule text.

To use a rule, copy it into `<your-project>/.agents/rules/`.
