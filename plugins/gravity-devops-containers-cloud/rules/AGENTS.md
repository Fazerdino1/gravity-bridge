<!-- Source: rules/containerization-docker-best-practices.md -->
Apply this rule when working on files matching: `**/Dockerfile`, `**/Dockerfile.*`, `**/*.dockerfile`, `**/docker-compose*.yml`, `**/docker-compose*.yaml`, `**/compose*.yml`, `**/compose*.yaml`.
# Containerization & Docker Best Practices
## Your Mission
## Core Principles of Containerization
### **1. Immutability**
- **Principle:** Once a container image is built, it should not change. Any changes should result in a new image.
- **Deeper Dive:**
- **Reproducible Builds:** Every build should produce identical results given the same inputs. This requires deterministic build processes, pinned dependency versions, and controlled build environments.
> Full reference inside this plugin: `references/containerization-docker-best-practices.md` (read on demand when working on matching files).

---

<!-- Source: rules/kubernetes-deployment-best-practices.md -->
# Kubernetes Deployment Best Practices
## Your Mission
## Core Kubernetes Concepts for Deployment
### **1. Pods**
- **Principle:** The smallest deployable unit in Kubernetes. Represents a single instance of a running process in your cluster.
- **Guidance for Copilot:**
- Design Pods to run a single primary container (or tightly coupled sidecars).
- Define `resources` (requests/limits) for CPU and memory to prevent resource exhaustion.
- Implement `livenessProbe` and `readinessProbe` for health checks.
- **Pro Tip:** Avoid deploying Pods directly; use higher-level controllers like Deployments or StatefulSets.
### **2. Deployments**
> Full reference inside this plugin: `references/kubernetes-deployment-best-practices.md` (read on demand when working on matching files).

---

<!-- Source: rules/kubernetes-manifests.md -->
Apply this rule when working on files matching: `k8s/**/*.yaml`, `k8s/**/*.yml`, `manifests/**/*.yaml`, `manifests/**/*.yml`, `deploy/**/*.yaml`, `deploy/**/*.yml`, `charts/**/templates/**/*.yaml`, `charts/**/templates/**/*.yml`.
# Kubernetes Manifests Instructions
## Your Mission
## Labeling Conventions
- `app.kubernetes.io/name`: Application name
- `app.kubernetes.io/instance`: Instance identifier
- `app.kubernetes.io/version`: Version
- `app.kubernetes.io/component`: Component role
- `app.kubernetes.io/part-of`: Application group
- `app.kubernetes.io/managed-by`: Management tool
- `environment`: Environment name
- `team`: Owning team
- `cost-center`: For billing
> Full reference inside this plugin: `references/kubernetes-manifests.md` (read on demand when working on matching files).

---

<!-- Source: rules/github-actions-ci-cd-best-practices.md -->
Apply this rule when working on files matching: `.github/workflows/*.yml`, `.github/workflows/*.yaml`.
# GitHub Actions CI/CD Best Practices
## Your Mission
## Core Concepts and Structure
### **1. Workflow Structure (`.github/workflows/*.yml`)**
- **Principle:** Workflows should be clear, modular, and easy to understand, promoting reusability and maintainability.
- **Deeper Dive:**
- **Naming Conventions:** Use consistent, descriptive names for workflow files (e.g., `build-and-test.yml`, `deploy-prod.yml`).
> Full reference inside this plugin: `references/github-actions-ci-cd-best-practices.md` (read on demand when working on matching files).
