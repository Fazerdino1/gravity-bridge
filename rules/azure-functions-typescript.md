---
trigger: model_decision
description: TypeScript patterns for Azure Functions. Applies to files matching **/*.ts, **/*.js, **/*.json.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/azure-functions-typescript.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Aaron Powell
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.ts`, `**/*.js`, `**/*.json`.

## Guidance for Code Generation
- Generate modern TypeScript code for Node.js
- Use `async/await` for asynchronous code
- Whenever possible, use Node.js v22 LTS built-in modules instead of external packages
- Always use Node.js async functions, like `node:fs/promises` instead of `fs` to avoid blocking the event loop
- Ask before adding any extra dependencies to the project
- The API is built using Azure Functions using `@azure/functions@4` package.
- Each endpoint should have its own function file, and use the following naming convention: `src/functions/<resource-name>-<http-verb>.ts`
- When making changes to the API, make sure to update the OpenAPI schema (if it exists) and `README.md` file accordingly.
