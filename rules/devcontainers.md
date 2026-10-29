---
trigger: model_decision
description: Twelve sourced rules for reviewing and authoring devcontainer.json, Dev Container Features, and Codespaces lifecycle configuration. Every rule cites the Dev Container specification, the reference CLI source, or official vendor documentation, states the concrete fix, and needs only file reading rather than a command to run. Applies to files matching **/devcontainer.json, **/.devcontainer.json, **/.devcontainer/**, **/devcontainer-feature.json.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/devcontainers.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Emil Dan
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/devcontainer.json`, `**/.devcontainer.json`, `**/.devcontainer/**`, `**/devcontainer-feature.json`.

# Dev Container Configuration

Twelve rules for reviewing and writing `devcontainer.json`, Dev Container Features, and the lifecycle configuration that GitHub Codespaces and the reference CLI act on. Each rule states the assertion, what to look for, and the concrete change, and links the source it comes from so the claim can be checked rather than trusted.

Every rule here is a reading task. Some need only `devcontainer.json`; some also read a Feature's `devcontainer-feature.json` or its `install.sh`; and some read what else the repository holds — a Codespaces prebuild or CI configuration, a Dockerfile step, an ownership-correcting script. None requires building an image, starting a container, or having the `devcontainer` CLI installed — which is what makes them usable in a code review, where no command can be run at all.

Two rules are easy to over-apply. Read the paragraphs marked **Do not report** before flagging anything about secrets in `remoteEnv` or about `updateRemoteUserUID`.

## What the file tells you, and what it does not

At runtime, `devcontainer.json` is merged with the `devcontainer.metadata` label baked into the image, and the specification's image-metadata section states: "When the order matters, the devcontainer.json is considered last."

So a value **present** in the file wins that merge and can be relied on. A value **absent** from the file may still be supplied by the image label, and the file alone cannot tell you it was not. Say what the file states, and say where the label could still change it. Do not report the absence of a lifecycle command, `waitFor`, `remoteEnv`, `containerEnv`, `mounts`, `remoteUser`, `containerUser`, `updateRemoteUserUID` or `userEnvProbe` as proof that the behaviour is absent.

**Where a property is exempt from that caution, read it off a positive marker — never infer it from absence.** The property reference tags each storable property: "Metadata properties marked with a 🏷️ can be stored in the `devcontainer.metadata` **container image label** in addition to `devcontainer.json`." An *untagged row* attests that a property is not label-storable. A property with **no row at all** is one the source is silent about, and silence is not immunity. Do not subtract one list from another to obtain immunity: the image-metadata document declares its own enumerations open — "We can add to these lists as we add more properties to the dev container configuration and the feature metadata." — and the complement of an open list is not a fact.

Read that way, of the properties the rules below reason about, `features`, `overrideFeatureInstallOrder` and `appPort` have untagged rows and are attested not label-storable. Top-level `extensions`, `settings` and `devPort` are VS Code schema properties with no row in the reference at all: unattested in either direction, so do not call them label-immune.

That costs the deprecated-properties rule below nothing, because what protects it is not immunity but **direction**. It reports only keys it can *see* in the configuration, and a value present in the file wins the merge — so the three unattested names can cost it a missed finding and can never produce a false one. That makes the finding sound; it does not make the rule label-immune, and the two are not the same thing. Apply the same test to every rule here: report what the file states, and say where the label could still change it.

Sources: <https://containers.dev/implementors/spec/>, <https://containers.dev/implementors/json_reference/> and <https://github.com/devcontainers/spec/blob/main/docs/specs/image-metadata.md>

## Lifecycle commands

### Cacheable setup belongs in `onCreateCommand` or `updateContentCommand`, never in `postCreateCommand`

A Codespaces prebuild performs "setup operations up to and including any `onCreateCommand` and `updateContentCommand` commands in the `devcontainer.json` file. No `postCreateCommand` commands are run during the creation of a prebuild." The reference CLI's `--prebuild` flag behaves the same way: it stops after `updateContentCommand` and re-runs it. Dependency installation left in `postCreateCommand` is therefore never baked into the prebuild and is paid again on every codespace start.

Look for expensive, cacheable work in `postCreateCommand` — `npm ci`, `npm install`, `yarn install`, `pnpm install`, `pip install`, `poetry install`, `bundle install`, `go mod download`, `cargo fetch`, `apt-get install`, `make`, `gradle`, `mvn` — while `onCreateCommand` and `updateContentCommand` are absent or trivial. Check the object form entry by entry, not just the string form.

**Fix:** move the cacheable half into `onCreateCommand`, which the reference describes as used by cloud services "when caching or prebuilding a container. This means that it will not typically have access to user-scoped assets or secrets", or into `updateContentCommand`, which those services "will also periodically execute ... to refresh cached or prebuilt containers". Leave in `postCreateCommand` only work that needs the assigned user's own credentials or permissions.

**Scope.** This only costs a project that actually uses prebuilds — a Codespaces prebuild configuration, or a CI job invoking `devcontainer up --prebuild`. A repository that never prebuilds is not wrong to install dependencies in `postCreateCommand`. Say so rather than reporting a defect.

Sources: <https://docs.github.com/en/codespaces/prebuilding-your-codespaces/about-github-codespaces-prebuilds> and <https://containers.dev/implementors/json_reference/>

### `waitFor` accepts exactly five values, and `postAttachCommand` is not one of them

The base schema fixes the enum: `"enum": [ "initializeCommand", "onCreateCommand", "updateContentCommand", "postCreateCommand", "postStartCommand" ]`, described as "The user command to wait for before continuing execution in the background while the UI is starting up. The default is \"updateContentCommand\"."

Anything outside those five strings is invalid. `postAttachCommand` is the value people reach for, because it is a real lifecycle hook and the only one missing from the enum. Nothing in a normal workflow catches the mistake: the reference CLI parses and merges the configuration but does not validate it against the JSON Schema, so an invalid `waitFor` reaches the tool unchallenged, and schema registration only produces editor-time squiggles. (That last mechanism is stated by no document; it is checkable by inspection — treat it as background, not as cited.)

**Fix:** choose from the five. If the intent was "block until my setup finishes", the value is `postCreateCommand`, not `postAttachCommand`. If the intent was the default, delete the property. Note what the default implies: `postCreateCommand` runs in the background after the tool reports success, so a slow `postCreateCommand` is not a hang.

Source: <https://github.com/devcontainers/spec/blob/main/schemas/devContainer.base.schema.json>

### Lifecycle hooks take a string, an array, or an object — and object entries run in parallel

The specification extends every lifecycle script to the object form: "The key of the `object` will be a unique name for the command and the value will be the `string` or `array` command. ... Each entry in the `object` will be run in parallel during that lifecycle step."

Determine which of the three forms each hook uses before applying any other lifecycle rule. A string runs through `/bin/sh`, so `&&` chains. An array is executed directly with no shell, so `["npm start && npm test"]` is one argv and `&&` is a literal argument, not an operator. An object runs every entry concurrently: flag entries that assume ordering between each other, such as one entry creating a directory or database that another entry writes to. The same source adds that "Each command must exit successfully for the stage to be considered successful", so one failing parallel entry fails the whole stage.

**Fix:** use the object form only for genuinely independent work. Where entries must be sequenced, put them in one string joined with `&&`, or in one script invoked from the hook. Use the array form deliberately when an argument must survive verbatim without shell parsing — not by accident.

Source: <https://github.com/devcontainers/spec/blob/main/docs/specs/parallel-lifecycle-script-execution.md>

## Secrets and environment

### `remoteEnv` is written into the image metadata label by default, so literal credentials there are readable by anyone who can pull the image

The reference CLI defines a hidden flag: `'omit-config-remote-env-from-metadata': { type: 'boolean', default: false, hidden: true, description: 'Omit remoteEnv from devcontainer.json for container metadata label' }`.

`default: false` on the *omit* flag is the CLI stating outright that the omission is off — `remoteEnv` **is** written to the `devcontainer.metadata` label unless you ask otherwise. `hidden: true` sharpens it: the flag does not appear in `--help`, so an operator will not discover the behaviour by asking the tool.

**The value decides, not the key. Do not report** an entry whose value is a substitution reference — `${localEnv:NAME}` or `${containerEnv:NAME}`, with or without a `:default` — at any severity, whatever the key is called. The literal never enters the file and never reaches the image label, which is this rule's entire subject. `"GITHUB_TOKEN": "${localEnv:GITHUB_TOKEN}"` is precisely the form the fix below prescribes; flagging it contradicts the rule's own remedy. A secret-shaped key name — `TOKEN`, `SECRET`, `KEY`, `PASSWORD`, `PASSWD`, `CREDENTIAL`, `_PAT` — is a reason to read the value and is never by itself a reason to report.

Report a literal that looks like a credential: a long opaque string, a recognisable prefix such as `sk_`, `ghp_`, `github_pat_`, `AKIA`, `xoxb-`, `glpat-`, a PEM header, or a connection string with an embedded password. Do not report a literal that is plainly not a credential — an environment name, a port, a path, a host, or a URL carrying no credential. Where a literal is genuinely ambiguous, let the key name decide the direction: under a secret-shaped key, report it, since a short low-entropy value such as `hunter2` under `PASSWORD` is still a finding unless it is an obvious placeholder like `changeme` or `<your-key-here>`; under any other key, describe what you see rather than asserting a leak.

`containerEnv` is worse than `remoteEnv` for a literal, because it becomes a Dockerfile `ENV` and is baked into a layer. Apply the same value test — never a key-name test — to `build.args`, which are visible in image history.

**Fix:** declare the name under the top-level `secrets` property so the configuration documents what is needed — that property is declarative only, it injects nothing — and pass the value at run time with `--secrets-file <json>` on `up` or `run-user-commands`. If a value must stay in `remoteEnv`, indirect it through `${localEnv:NAME}` so the literal is not committed, and remember the label still records the reference. **Keep the secrets file out of the repository:** a path inside the workspace is one `git add .` away from committing the secret this rule exists to protect. Put it under the user's home directory, or, if it must live in the tree, add it to `.gitignore` in the same change and verify with `git check-ignore`.

Source: <https://github.com/devcontainers/cli/blob/main/src/spec-node/devContainersSpecCLI.ts>

### `userEnvProbe` decides which shell startup files the lifecycle environment sees

The property "Indicates the type of shell to use to \"probe\" for user environment variables to include in `devcontainer.json` supporting services' / tools' processes: `none`, `interactiveShell`, `loginShell`, or `loginInteractiveShell` (default)."

`"none"` is the high-signal value: no startup file is read at all, so anything a Feature or Dockerfile put on `PATH` via `~/.bashrc` or `/etc/profile.d` is invisible to lifecycle commands even though an interactive terminal in the same container finds it. `"loginShell"` and `"interactiveShell"` each read only half the files — the same page notes that "bash interactive shells will typically include variables set in `/etc/bash.bashrc` and `~/.bashrc` while login shells usually include variables from `/etc/profile` and `~/.profile`. Setting this property to `loginInteractiveShell` will get variables from all four files." Suspect this rule whenever a lifecycle command fails with "command not found" for a tool that is demonstrably installed.

**Fix:** prefer the default `loginInteractiveShell` and delete an explicit `userEnvProbe` unless something depends on narrowing it. Where the environment must not depend on shell startup files at all, set the variables in `containerEnv` (visible to every process in the container) or `remoteEnv` (tool processes only — see the secrets rule above before putting anything sensitive there), or invoke the tool by absolute path in the lifecycle command.

Source: <https://containers.dev/implementors/json_reference/>

## Dev Container Features

### `overrideFeatureInstallOrder` cannot reorder a dependency edge

The Features specification is explicit: the property "must not influence the dependency relationship as defined by the dependency graph ... and shall only be evaulated at the round-based sorting step ... this property cannot \"pull forward\" a Feature until all of its dependencies (both soft and hard) have been installed."

Read `overrideFeatureInstallOrder` against the `dependsOn` and `installsAfter` edges of the Features listed in `features`. Flag an entry that tries to place a Feature before something it depends on: the requested order will silently not happen. The mechanism, from the same page, is that the property assigns a `roundPriority` "to all nodes that match the Feature identifier (version omitted) present in the property" — priority reorders only *within* a round and never moves a node into an earlier round. Also flag an identifier listed there that is not among the Features being installed; the same page says the tool "may fail the dependency resolution step" for that.

**Fix:** if the ordering is a real requirement, express it in the Feature's own `dependsOn` (hard, recursive, can carry options and a pinned version) or `installsAfter` (soft, non-recursive, dropped if the named Feature is not otherwise installed). Use `overrideFeatureInstallOrder` only to break ties the graph leaves open.

Source: <https://containers.dev/implementors/features/>

### Feature dependency resolution happens once, at creation from `devcontainer.json` — and Features must be idempotent

From the dependency specification: "For subsequent creations from an image (or resumes of a dev container), the dependency tree is **not** re-calculated. ... Since two Features with different options are considered different, a single Feature may be installed more than once. Features should be idempotent."

Two symptoms. First, a configuration that starts `FROM` a previously built dev container image and expects a Feature version bump or a changed `dependsOn` to take effect: it will not, because the *resolved* Feature set is frozen onto the `devcontainer.metadata` label at first creation. Second, the same Feature referenced twice with different options — directly in `features`, or once directly and once pulled in by another Feature's `dependsOn` — which installs it twice. If you author Features, read `install.sh` for non-idempotent steps: appending to `PATH`, `~/.bashrc` or `/etc/profile.d` without a guard, `useradd` without a check, unconditional `git clone`.

**Fix:** to pick up changed dependencies, recreate from `devcontainer.json` rather than rebuilding from the image — the source states the image or dev container must be deleted and recreated. In an authored Feature, make every step re-runnable: guard appends with a marker grep, use `install -D`, check before creating users, and make downloads overwrite rather than append.

Source: <https://github.com/devcontainers/spec/blob/main/docs/specs/feature-dependencies.md>

### A Feature's `install.sh` runs as root, so read the eventual user from `_REMOTE_USER` rather than hardcoding one

"The `install.sh` script for each Feature should be executed as `root` during a container image build. ... `_REMOTE_USER` and `_CONTAINER_USER` environment variables are passed to the Features scripts with `_CONTAINER_USER` being the container's user". The home directories have their own variables: "the home folders of the two users are passed to the Feature scripts as `_REMOTE_USER_HOME` and `_CONTAINER_USER_HOME` environment variables."

In an authored `install.sh`, flag a hardcoded `vscode`, `node`, `codespace` or `root` username, and flag any write into a home directory computed as `/home/$USER` or `~`. When consuming Features, the visible symptom is files under the workspace or home directory owned by `root` that the `remoteUser` cannot write.

**Fix:** read the user from `_REMOTE_USER`, falling back to `_CONTAINER_USER` (the specification says the two are equal when no `remoteUser` is configured), and the home directory from `_REMOTE_USER_HOME`. Drop privileges for user-scoped work with `su "$_REMOTE_USER" -c '...'`, or `chown -R "$_REMOTE_USER" "$_REMOTE_USER_HOME/<path>"` after writing as root. Never assume `sudo` exists in the base image.

Source: <https://containers.dev/implementors/features/>

## Users, ownership and UIDs

### A named volume mounted to dodge the bind-mount penalty comes up root-owned and needs an explicit `chown`

The performance guidance is direct: "add a `postCreateCommand` to update the owner of the folder you mount since it may have been mounted as root".


---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/devcontainers-full.md](../docs/rule-references/devcontainers-full.md). Read that file on demand when deeper details are needed.
