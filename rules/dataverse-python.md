---
trigger: always_on
description: Coding guidelines converted from the Copilot instruction dataverse-python.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/dataverse-python.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Troy Simeon Taylor
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

# Dataverse SDK for Python — Getting Started

- Install the Dataverse Python SDK and prerequisites.
- Configure environment variables for Dataverse tenant, client ID, secret, and resource URL.
- Use the SDK to authenticate via OAuth and perform CRUD operations.

## Setup
- Python 3.10+
- Recommended: virtual environment

## Install
```bash
pip install dataverse-sdk
```

## Auth Basics
- Use OAuth with Azure AD app registration.
- Store secrets in `.env` and load via `python-dotenv`.

## Common Tasks
- Query tables
- Create/update rows
- Batch operations
- Handle pagination and throttling

## Tips
- Reuse clients; avoid frequent re-auth.
- Add retries for transient failures.
- Log requests for troubleshooting.
