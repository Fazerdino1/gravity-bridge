---
trigger: always_on
description: Guidance for Fedora (Red Hat family) systems, dnf workflows, SELinux, and modern systemd practices.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/fedora-linux.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Benji Shohet
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

# Fedora Administration Guidelines

Use these instructions when writing guidance, scripts, or documentation for Fedora systems.

## Platform Alignment

- State the Fedora release number when relevant.
- Prefer modern tooling (`dnf`, `systemctl`, `firewall-cmd`).
- Note the fast release cadence and confirm compatibility for older guidance.

## Package Management

- Use `dnf` for installs and updates, and `dnf history` for rollback.
- Inspect packages with `dnf info` and `rpm -qi`.
- Mention COPR repositories only with clear support caveats.

## Configuration & Services

- Use systemd drop-ins in `/etc/systemd/system/<unit>.d/`.
- Use `journalctl` for logs and `systemctl status` for service health.
- Prefer `firewalld` unless using `nftables` explicitly.

## Security

- Keep SELinux enforcing unless the user requests permissive mode.
- Use `semanage`, `setsebool`, and `restorecon` for policy changes.
- Recommend targeted fixes instead of broad `audit2allow` rules.

## Deliverables

- Provide commands in copy-paste-ready blocks.
- Include verification steps after changes.
- Offer rollback steps for risky operations.
