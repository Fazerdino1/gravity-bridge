---
trigger: model_decision
description: ColdFusion cfm files and application patterns. Applies to files matching **/*.cfm.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/coldfusion-cfm.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Nathan Stanford Sr
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.cfm`.

# ColdFusion Coding Standards

- Use CFScript where possible for cleaner syntax.
- Avoid using deprecated tags and functions.
- Follow consistent naming conventions for variables and components.
- Use `cfqueryparam` to prevent SQL injection.
- Escape CSS hash symbols inside <cfoutput> blocks using ##
- When using HTMX inside <cfoutput> blocks, escape hash symbols (#) by using double hashes (##) to prevent unintended variable interpolation.
- If you are in a HTMX target file then make sure the top line is: <cfsetting showDebugOutput = "false">

# Additional Best Practices

- Use `Application.cfc` for application settings and request handling.
- Organize code into reusable CFCs (components) for maintainability.
- Validate and sanitize all user input.
- Use `cftry`/`cfcatch` for error handling and logging.
- Avoid hardcoding credentials or sensitive data in source files.
- Use consistent indentation (2 spaces, as per global standards).
- Comment complex logic and document functions with purpose and parameters.
- Prefer `cfinclude` for shared templates, but avoid circular includes.

- Use ternary operators where possible
- Ensure consistent tab alignment.
