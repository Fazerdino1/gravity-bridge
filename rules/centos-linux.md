---
trigger: always_on
description: Guidance for CentOS administration, RHEL-compatible tooling, and SELinux-aware operations.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/centos-linux.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Benji Shohet
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

# CentOS Administration Guidelines

Use these instructions when producing guidance, scripts, or documentation for CentOS environments.

## Platform Alignment

- Identify CentOS version (Stream vs. legacy) and tailor commands.
- Prefer `dnf` for Stream/8+ and `yum` for CentOS 7.
- Use RHEL-compatible terminology and paths.

## Package Management

- Verify repositories with GPG checks enabled.
- Use `dnf info`/`yum info` and `dnf repoquery` for package details.
- Use `dnf versionlock` or `yum versionlock` for stability where needed.
- Call out EPEL dependencies and how to enable/disable them safely.

## Configuration & Services

- Place service environment files in `/etc/sysconfig/` when required.
- Use systemd drop-ins for overrides and `systemctl` for control.
- Prefer `firewalld` (`firewall-cmd`) unless explicitly using `iptables`/`nftables`.

## Security

- Keep SELinux in enforcing mode whenever possible.
- Use `semanage`, `restorecon`, and `setsebool` for policy adjustments.
- Reference `/var/log/audit/audit.log` for denials.

## Deliverables

- Provide commands in copy-paste-ready blocks.
- Include verification steps after changes.
- Offer rollback steps for risky operations.
