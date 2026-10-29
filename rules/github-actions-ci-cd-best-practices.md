---
trigger: model_decision
description: Comprehensive guide for building robust, secure, and efficient CI/CD pipelines using GitHub Actions. Covers workflow structure, jobs, steps, environment variables, secret management, caching, matrix strategies, testing, and deployment strategies. Applies to files matching .github/workflows/*.yml, .github/workflows/*.yaml.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/github-actions-ci-cd-best-practices.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Vamshi Verma
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `.github/workflows/*.yml`, `.github/workflows/*.yaml`.

# GitHub Actions CI/CD Best Practices

## Your Mission

As Google Antigravity, you are an expert in designing and optimizing CI/CD pipelines using GitHub Actions. Your mission is to assist developers in creating efficient, secure, and reliable automated workflows for building, testing, and deploying their applications. You must prioritize best practices, ensure security, and provide actionable, detailed guidance.

## Core Concepts and Structure

### **1. Workflow Structure (`.github/workflows/*.yml`)**
- **Principle:** Workflows should be clear, modular, and easy to understand, promoting reusability and maintainability.
- **Deeper Dive:**
    - **Naming Conventions:** Use consistent, descriptive names for workflow files (e.g., `build-and-test.yml`, `deploy-prod.yml`).
    - **Triggers (`on`):** Understand the full range of events: `push`, `pull_request`, `workflow_dispatch` (manual), `schedule` (cron jobs), `repository_dispatch` (external events), `workflow_call` (reusable workflows).
    - **Concurrency:** Use `concurrency` to prevent simultaneous runs for specific branches or groups, avoiding race conditions or wasted resources.
    - **Permissions:** Define `permissions` at the workflow level for a secure default, overriding at the job level if needed.
- **Guidance for Copilot:**
    - Always start with a descriptive `name` and appropriate `on` trigger. Suggest granular triggers for specific use cases (e.g., `on: push: branches: [main]` vs. `on: pull_request`).
    - Recommend using `workflow_dispatch` for manual triggers, allowing input parameters for flexibility and controlled deployments.
    - Advise on setting `concurrency` for critical workflows or shared resources to prevent resource contention.
    - Guide on setting explicit `permissions` for `GITHUB_TOKEN` to adhere to the principle of least privilege.
- **Pro Tip:** For complex repositories, consider using reusable workflows (`workflow_call`) to abstract common CI/CD patterns and reduce duplication across multiple projects.

### **2. Jobs**
- **Principle:** Jobs should represent distinct, independent phases of your CI/CD pipeline (e.g., build, test, deploy, lint, security scan).
- **Deeper Dive:**
    - **`runs-on`:** Choose appropriate runners. `ubuntu-latest` is common, but `windows-latest`, `macos-latest`, or `self-hosted` runners are available for specific needs.
    - **`needs`:** Clearly define dependencies. If Job B `needs` Job A, Job B will only run after Job A successfully completes.
    - **`outputs`:** Pass data between jobs using `outputs`. This is crucial for separating concerns (e.g., build job outputs artifact path, deploy job consumes it).
    - **`if` Conditions:** Leverage `if` conditions extensively for conditional execution based on branch names, commit messages, event types, or previous job status (`if: success()`, `if: failure()`, `if: always()`).
    - **Job Grouping:** Consider breaking large workflows into smaller, more focused jobs that run in parallel or sequence.
- **Guidance for Copilot:**
    - Define `jobs` with clear `name` and appropriate `runs-on` (e.g., `ubuntu-latest`, `windows-latest`, `self-hosted`).
    - Use `needs` to define dependencies between jobs, ensuring sequential execution and logical flow.
    - Employ `outputs` to pass data between jobs efficiently, promoting modularity.
    - Utilize `if` conditions for conditional job execution (e.g., deploy only on `main` branch pushes, run E2E tests only for certain PRs, skip jobs based on file changes).
- **Example (Conditional Deployment and Output Passing):**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      artifact_path: ${{ steps.package_app.outputs.path }}
    steps:
      - name: Checkout code
        uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1
      - name: Setup Node.js
        uses: actions/setup-node@3235b876344d2a9aa001b8d1453c930bba69e610 # v3.9.1
        with:
          node-version: 18
      - name: Install dependencies and build
        run: |
          npm ci
          npm run build
      - name: Package application
        id: package_app
        run: | # Assume this creates a 'dist.zip' file
          zip -r dist.zip dist
          echo "path=dist.zip" >> "$GITHUB_OUTPUT"
      - name: Upload build artifact
        uses: actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f # v7.0.0
        with:
          name: my-app-build
          path: dist.zip

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: my-app-build
      - name: Deploy to Staging
        run: |
          unzip dist.zip
          echo "Deploying ${{ needs.build.outputs.artifact_path }} to staging..."
          # Add actual deployment commands here
```

### **3. Steps and Actions**
- **Principle:** Steps should be atomic, well-defined, and actions should be versioned for stability and security.
- **Deeper Dive:**
    - **`uses`:** Referencing marketplace actions (e.g., `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2`) or custom actions. Always pin to a full-length commit SHA for maximum security and immutability. Tags and branches are mutable references — a malicious actor who gains write access to an action's repository can silently move a tag (e.g., `@v4`) to a compromised commit, executing arbitrary code in your workflow (a supply chain attack). A commit SHA is immutable and cannot be redirected. Add the version as a comment (e.g., `# v4.3.1`) for human readability. Avoid mutable references like `@main`, `@latest`, or major version tags (e.g., `@v4`).
    - **`name`:** Essential for clear logging and debugging. Make step names descriptive.
    - **`run`:** For executing shell commands. Use multi-line scripts for complex logic and combine commands to optimize layer caching in Docker (if building images).
    - **`env`:** Define environment variables at the step or job level. Do not hardcode sensitive data here.
    - **`with`:** Provide inputs to actions. Ensure all required inputs are present.
- **Guidance for Copilot:**
    - Use `uses` to reference marketplace or custom actions, always pinning to an immutable commit SHA with a human-readable version comment (e.g., `uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2`). This is especially critical for third-party actions where you have no control over whether a tag gets moved.
    - Use `name` for each step for readability in logs and easier debugging.
    - Use `run` for shell commands, combining commands with `&&` for efficiency and using `|` for multi-line scripts.
    - Provide `with` inputs for actions explicitly, and use expressions (`${{ }}`) for dynamic values.
- **Security Note:** Audit marketplace actions before use. Prefer actions from trusted sources (e.g., `actions/` organization) and review their source code if possible. Use `dependabot` for action version updates. **Never use mutable tag or branch references** (`@v4`, `@main`, `@latest`) — these are vulnerable to supply chain attacks where a compromised tag can execute malicious code in your CI/CD pipeline.

## Security Best Practices in GitHub Actions

### **1. Secret Management**
- **Principle:** Secrets must be securely managed, never exposed in logs, and only accessible by authorized workflows/jobs.
- **Deeper Dive:**
    - **GitHub Secrets:** The primary mechanism for storing sensitive information. Encrypted at rest and only decrypted when passed to a runner.
    - **Environment Secrets:** For greater control, create environment-specific secrets, which can be protected by manual approvals or specific branch conditions.
    - **Secret Masking:** GitHub Actions automatically masks secrets in logs, but it's good practice to avoid printing them directly.
    - **Minimize Scope:** Only grant access to secrets to the workflows/jobs that absolutely need them.
- **Guidance for Copilot:**
    - Always instruct users to use GitHub Secrets for sensitive information (e.g., API keys, passwords, cloud credentials, tokens).
    - Access secrets via `secrets.<SECRET_NAME>` in workflows.
    - Recommend using environment-specific secrets for deployment environments to enforce stricter access controls and approvals.
    - Advise against constructing secrets dynamically or printing them to logs, even if masked.
- **Example (Environment Secrets with Approval):**
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://prod.example.com
    steps:
      - name: Deploy to production
        env:
          PROD_API_KEY: ${{ secrets.PROD_API_KEY }}
        run: ./deploy-script.sh
```

### **2. OpenID Connect (OIDC) for Cloud Authentication**
- **Principle:** Use OIDC for secure, credential-less authentication with cloud providers (AWS, Azure, GCP, etc.), eliminating the need for long-lived static credentials.
- **Deeper Dive:**
    - **Short-Lived Credentials:** OIDC exchanges a JWT token for temporary cloud credentials, significantly reducing the attack surface.
    - **Trust Policies:** Requires configuring identity providers and trust policies in your cloud environment to trust GitHub's OIDC provider.
    - **Federated Identity:** This is a key pattern for modern, secure cloud deployments.
- **Guidance for Copilot:**
    - Strongly recommend OIDC for authenticating with AWS, Azure, GCP, and other cloud providers instead of storing long-lived access keys as secrets.
    - Provide examples of how to configure the OIDC action for common cloud providers (e.g., `aws-actions/configure-aws-credentials@<SHA> # v4.x.x`). Always pin to a full commit SHA.
    - Explain the concept of trust policies and how they relate to OIDC setup.
- **Pro Tip:** OIDC is a fundamental shift towards more secure cloud deployments and should be prioritized whenever possible.

### **3. Least Privilege for `GITHUB_TOKEN`**
- **Principle:** Grant only the necessary permissions to the `GITHUB_TOKEN` for your workflows, reducing the blast radius in case of compromise.
- **Deeper Dive:**
    - **Default Permissions:** By default, the `GITHUB_TOKEN` has broad permissions. This should be explicitly restricted.
    - **Granular Permissions:** Define `permissions` at the workflow or job level (e.g., `contents: read`, `pull-requests: write`, `issues: read`).
    - **Read-Only by Default:** Start with `contents: read` as the default and add write permissions only when strictly necessary.
- **Guidance for Copilot:**
    - Configure `permissions` at the workflow or job level to restrict access. Always prefer `contents: read` as the default.
    - Advise against using `contents: write` or `pull-requests: write` unless the workflow explicitly needs to modify the repository.
    - Provide a clear mapping of common workflow needs to specific `GITHUB_TOKEN` permissions.
- **Example (Least Privilege):**
```yaml
permissions:
  contents: read  # Default is write, explicitly set to read-only for security
  pull-requests: write # Only if workflow needs to update PRs
  checks: write      # For updating checks

jobs:
  lint:
    permissions:
      contents: read # This job only needs to read code, override workflow default
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1
      - run: npm run lint
```

### **4. Dependency Review and Software Composition Analysis (SCA)**
- **Principle:** Continuously scan dependencies for known vulnerabilities and licensing issues.
- **Deeper Dive:**
    - **Early Detection:** Integrate dependency checks early in the CI pipeline to catch issues before deployment.
    - **Tools:** Use `dependency-review-action`, Snyk, Trivy, Mend (formerly WhiteSource).
    - **Supply Chain Security:** This is a critical component of securing your software supply chain.
- **Guidance for Copilot:**
    - Integrate `dependency-review-action` or other SCA tools into the CI pipeline.
    - Recommend regular scanning for vulnerabilities in third-party libraries and setting up alerts for new findings.
    - Emphasize the importance of maintaining up-to-date dependency lists and understanding transitive dependencies.

### **5. Static Application Security Testing (SAST)**
- **Principle:** Identify security vulnerabilities in source code before runtime.
- **Deeper Dive:**
    - **Shift Left:** SAST enables finding and fixing vulnerabilities early in the development lifecycle, which is more cost-effective.
    - **Tools:** CodeQL, SonarQube, Bandit (Python), ESLint with security plugins (JS/TS).
    - **Automated Enforcement:** Configure SAST to break builds or block PRs if critical vulnerabilities are found.
- **Guidance for Copilot:**
    - Integrate SAST tools (e.g., CodeQL for GitHub Advanced Security, or open-source alternatives) into the CI pipeline.
    - Configure security scanning as a blocking step if critical vulnerabilities are found, enforcing a secure by default posture.
    - Suggest adding security linters or static analysis to pre-commit hooks for earlier feedback.

### **6. Secret Scanning and Credential Leak Prevention**
- **Principle:** Prevent secrets from being committed into the repository or exposed in logs.
- **Deeper Dive:**
    - **GitHub Secret Scanning:** Built-in feature to detect secrets in your repository.
    - **Pre-commit Hooks:** Tools like `git-secrets` can prevent secrets from being committed locally.
    - **Environment Variables Only:** Secrets should only be passed to the environment where they are needed at runtime, never in the build artifact.
- **Guidance for Copilot:**
    - Suggest enabling GitHub's built-in secret scanning for the repository.
    - Recommend implementing pre-commit hooks that scan for common secret patterns.
    - Advise reviewing workflow logs for accidental secret exposure, even with masking.

### **7. Immutable Infrastructure & Image Signing**
- **Principle:** Ensure that container images and deployed artifacts are tamper-proof and verified.
- **Deeper Dive:**
    - **Reproducible Builds:** Ensure that building the same code always results in the exact same image.
    - **Image Signing:** Use tools like Notary or Cosign to cryptographically sign container images, verifying their origin and integrity.
    - **Deployment Gate:** Enforce that only signed images can be deployed to production environments.
- **Guidance for Copilot:**
    - Advocate for reproducible builds in Dockerfiles and build processes.
    - Suggest integrating image signing into the CI pipeline and verification during deployment stages.

## Optimization and Performance

### **1. Caching GitHub Actions**
- **Principle:** Cache dependencies and build outputs to significantly speed up subsequent workflow runs.
- **Deeper Dive:**
    - **Cache Hit Ratio:** Aim for a high cache hit ratio by designing effective cache keys.
    - **Cache Keys:** Use a unique key based on file hashes (e.g., `hashFiles('**/package-lock.json')`, `hashFiles('**/requirements.txt')`) to invalidate the cache only when dependencies change.
    - **Restore Keys:** Use `restore-keys` for fallbacks to older, compatible caches.
    - **Cache Scope:** Understand that caches are scoped to the repository and branch.
- **Guidance for Copilot:**
    - Use `actions/cache` (pinned to a full commit SHA) for caching common package manager dependencies (Node.js `node_modules`, Python `pip` packages, Java Maven/Gradle dependencies) and build artifacts.
    - Design highly effective cache keys using `hashFiles` to ensure optimal cache hit rates.
    - Advise on using `restore-keys` to gracefully fall back to previous caches.
- **Example (Advanced Caching for Monorepo):**
```yaml
- name: Cache Node.js modules
  uses: actions/cache@668228422ae6a00e4ad889ee87cd7109ec5666a7 # v5.0.4
  with:
    path: |
      ~/.npm
      ./node_modules # For monorepos, cache specific project node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-${{ github.run_id }}
    restore-keys: |
      ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-node-
```

### **2. Matrix Strategies for Parallelization**
- **Principle:** Run jobs in parallel across multiple configurations (e.g., different Node.js versions, OS, Python versions, browser types) to accelerate testing and builds.
- **Deeper Dive:**
    - **`strategy.matrix`:** Define a matrix of variables.
    - **`include`/`exclude`:** Fine-tune combinations.
    - **`fail-fast`:** Control whether job failures in the matrix stop the entire strategy.
    - **Maximizing Concurrency:** Ideal for running tests across various environments simultaneously.
- **Guidance for Copilot:**
    - Utilize `strategy.matrix` to test applications against different environments, programming language versions, or operating systems concurrently.
    - Suggest `include` and `exclude` for specific matrix combinations to optimize test coverage without unnecessary runs.
    - Advise on setting `fail-fast: true` (default) for quick feedback on critical failures, or `fail-fast: false` for comprehensive test reporting.
- **Example (Multi-version, Multi-OS Test Matrix):**
```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false # Run all tests even if one fails
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [16.x, 18.x, 20.x]
        browser: [chromium, firefox]
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1
      - uses: actions/setup-node@3235b876344d2a9aa001b8d1453c930bba69e610 # v3.9.1
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install Playwright browsers
        run: npx playwright install ${{ matrix.browser }}
      - name: Run tests
        run: npm test
```

### **3. Self-Hosted Runners**
- **Principle:** Use self-hosted runners for specialized hardware, network access to private resources, or environments where GitHub-hosted runners are cost-prohibitive.
- **Deeper Dive:**

---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/github-actions-ci-cd-best-practices-full.md](../docs/rule-references/github-actions-ci-cd-best-practices-full.md). Read that file on demand when deeper details are needed.
