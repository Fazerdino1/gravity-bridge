---
trigger: model_decision
description: Pointer to the java-upgrade skill when changing the Java version in Maven or Gradle build files. Applies to files matching **/pom.xml, **/build.gradle, **/build.gradle.kts.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/java-upgrade.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Julien Dubois
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/pom.xml`, `**/build.gradle`, `**/build.gradle.kts`.

# Java Version Upgrades

When the task changes the Java version of this project (compiler release, toolchain, `java.version`), use the `java-upgrade` skill. It detects the current version and loads only the matching guide for Java 11 → 17, 17 → 21 or 21 → 25.

If the skill is not installed, install it with `gh skills install github/awesome-copilot java-upgrade` or copy `skills/java-upgrade/` from this repository.

- Upgrade one LTS version at a time and run the full test suite after each step.
- Check the minimum Java version supported by the project's frameworks and dependencies before raising the target.
