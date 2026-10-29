<!-- Source: rules/markdown.md -->
Apply this rule when working on files matching: `**/*.md`.
# CommonMark Markdown
## Preliminaries
- A line ends at a newline (`U+000A`), carriage return (`U+000D`), or end of file. A blank line contains only spaces or tabs.
- Tabs behave as 4-space tab stops for block structure but are not expanded in content.
- Replace `U+0000` with the replacement character `U+FFFD`.
- **Backslash escapes**: `\` before any ASCII punctuation character renders the literal character. Not recognized in code spans, code blocks, or autolinks.
> Full reference inside this plugin: `references/markdown.md` (read on demand when working on matching files).
