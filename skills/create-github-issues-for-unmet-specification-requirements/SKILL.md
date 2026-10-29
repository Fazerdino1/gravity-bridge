---
name: create-github-issues-for-unmet-specification-requirements
description: Create GitHub Issues for unimplemented requirements from specification files using feature_request.yml template.
source_url: https://github.com/github/awesome-copilot
source_path: skills/create-github-issues-for-unmet-specification-requirements/SKILL.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Daniel Scott-Raynsford
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

# Create GitHub Issues for Unmet Specification Requirements

Create GitHub Issues for unimplemented requirements in the specification at `<current-file>`.

## Process

1. Analyze specification file to extract all requirements
2. Check codebase implementation status for each requirement
3. Search existing issues using `search_issues` to avoid duplicates
4. Create new issue per unimplemented requirement using `create_issue`
5. Use `feature_request.yml` template (fallback to default)

## Requirements

- One issue per unimplemented requirement from specification
- Clear requirement ID and description mapping
- Include implementation guidance and acceptance criteria
- Verify against existing issues before creation

## Issue Content

- Title: Requirement ID and brief description
- Description: Detailed requirement, implementation method, and context
- Labels: feature, enhancement (as appropriate)

## Implementation Check

- Search codebase for related code patterns
- Check related specification files in `/spec/` directory
- Verify requirement isn't partially implemented
