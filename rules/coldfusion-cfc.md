---
trigger: model_decision
description: ColdFusion Coding Standards for CFC component and application patterns. Applies to files matching **/*.cfc.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/coldfusion-cfc.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Nathan Stanford Sr
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.cfc`.

# ColdFusion Coding Standards for CFC Files

- Use CFScript where possible for cleaner syntax.
- Avoid using deprecated tags and functions.
- Follow consistent naming conventions for variables and components.
- Use `cfqueryparam` to prevent SQL injection.
- Escape CSS hash symbols inside <cfoutput> blocks using ##

# Additional Best Practices

- Use `this` scope for component properties and methods when appropriate.
- Document all functions with purpose, parameters, and return values (use Javadoc or similar style).
- Use access modifiers (`public`, `private`, `package`, `remote`) for functions and variables.
- Prefer dependency injection for component collaboration.
- Avoid business logic in setters/getters; keep them simple.
- Validate and sanitize all input parameters in public/remote methods.
- Use `cftry`/`cfcatch` for error handling within methods as needed.
- Avoid hardcoding configuration or credentials in CFCs.
- Use consistent indentation (2 spaces, as per global standards).
- Group related methods logically within the component.
- Use meaningful, descriptive names for methods and properties.
- Avoid using `cfcomponent` attributes that are deprecated or unnecessary.

- Use ternary operators where possible
- Ensure consistent tab alignment.
