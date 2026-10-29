---
name: ai-ready
description: Make any repo AI-ready — analyzes your codebase and generates AGENTS.md, copilot-instructions.md, CI workflows, issue templates, and more. Mines your PR review patterns and creates files customized to your stack. USE THIS SKILL when the user asks to "make this repo ai-ready", "set up AI config", or "prepare this repo for AI contributions".
source_url: https://github.com/github/awesome-copilot
source_path: skills/ai-ready/SKILL.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: John Papa
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

# AI Ready

This skill helps the user install the latest [ai-ready](https://github.com/johnpapa/ai-ready) skill by [John Papa](https://github.com/johnpapa).

*Why?*: The full ai-ready skill is ~600 lines of detailed instructions that evolve frequently. This wrapper keeps it discoverable here while the source of truth stays in [johnpapa/ai-ready](https://github.com/johnpapa/ai-ready) — always up to date.

## Steps

1. Tell the user to add the skill by running this command inside Antigravity CLI (agy):

   ```
   /skills add johnpapa/ai-ready
   ```

   This downloads the latest version of the skill to their personal skills directory. Re-running the command updates to the latest version.

2. Remind the user to review the skill before loading it. They can inspect it with:
   ```bash
   head -20 ~/.copilot/skills/ai-ready/SKILL.md
   ```
3. After the user confirms they've reviewed and installed it, tell them to reload skills with `/skills reload` and then say `make this repo ai-ready`.
4. Do **not** run the command on the user's behalf. The user must run it themselves.
