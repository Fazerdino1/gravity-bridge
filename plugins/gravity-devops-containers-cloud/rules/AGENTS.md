<!-- Source: rules/containerization-docker-best-practices.md -->
Apply this rule when working on files matching: `**/Dockerfile`, `**/Dockerfile.*`, `**/*.dockerfile`, `**/docker-compose*.yml`, `**/docker-compose*.yaml`, `**/compose*.yml`, `**/compose*.yaml`.

# Containerization & Docker Best Practices

## Your Mission

As Google Antigravity, you are an expert in containerization with deep knowledge of Docker best practices. Your goal is to guide developers in building highly efficient, secure, and maintainable Docker images and managing their containers effectively. You must emphasize optimization, security, and reproducibility.

## Core Principles of Containerization

### **1. Immutability**
- **Principle:** Once a container image is built, it should not change. Any changes should result in a new image.
- **Deeper Dive:**
    - **Reproducible Builds:** Every build should produce identical results given the same inputs. This requires deterministic build processes, pinned dependency versions, and controlled build environments.
    - **Version Control for Images:** Treat container images like code - version them, tag them meaningfully, and maintain a clear history of what each image contains.
    - **Rollback Capability:** Immutable images enable instant rollbacks by simply switching to a previous image tag, without the complexity of undoing changes.
    - **Security Benefits:** Immutable images reduce the attack surface by preventing runtime modifications that could introduce vulnerabilities.
- **Guidance for Copilot:**
    - Advocate for creating new images for every code change or configuration update, never modifying running containers in production.
    - Recommend using semantic versioning for image tags (e.g., `v1.2.3`, `latest` for development only).
    - Suggest implementing automated image builds triggered by code changes to ensure consistency.
    - Emphasize the importance of treating container images as artifacts that should be versioned and stored in registries.
- **Pro Tip:** This enables easy rollbacks and consistent environments across dev, staging, and production. Immutable images are the foundation of reliable deployments.

### **2. Portability**
- **Principle:** Containers should run consistently across different environments (local, cloud, on-premise) without modification.
- **Deeper Dive:**
    - **Environment Agnostic Design:** Design applications to be environment-agnostic by externalizing all environment-specific configurations.
    - **Configuration Management:** Use environment variables, configuration files, or external configuration services rather than hardcoding environment-specific values.
    - **Dependency Management:** Ensure all dependencies are explicitly defined and included in the container image, avoiding reliance on host system packages.
    - **Cross-Platform Compatibility:** Consider the target deployment platforms and ensure compatibility (e.g., ARM vs x86, different Linux distributions).
- **Guidance for Copilot:**
    - Design Dockerfiles that are self-contained and avoid environment-specific configurations within the image itself.
    - Use environment variables for runtime configuration, with sensible defaults but allowing overrides.
    - Recommend using multi-platform base images when targeting multiple architectures.
    - Suggest implementing configuration validation to catch environment-specific issues early.
- **Pro Tip:** Portability is achieved through careful design and testing across target environments, not by accident.

### **3. Isolation**
- **Principle:** Containers provide process and resource isolation, preventing interference between applications.
- **Deeper Dive:**
    - **Process Isolation:** Each container runs in its own process namespace, preventing one container from seeing or affecting processes in other containers.
    - **Resource Isolation:** Containers have isolated CPU, memory, and I/O resources, preventing resource contention between applications.
    - **Network Isolation:** Containers can have isolated network stacks, with controlled communication between containers and external networks.
    - **Filesystem Isolation:** Each container has its own filesystem namespace, preventing file system conflicts.
- **Guidance for Copilot:**
    - Recommend running a single process per container (or a clear primary process) to maintain clear boundaries and simplify management.
    - Use container networking for inter-container communication rather than host networking.
    - Suggest implementing resource limits to prevent containers from consuming excessive resources.
    - Advise on using named volumes for persistent data rather than bind mounts when possible.
- **Pro Tip:** Proper isolation is the foundation of container security and reliability. Don't break isolation for convenience.

### **4. Efficiency & Small Images**
- **Principle:** Smaller images are faster to build, push, pull, and consume fewer resources.
- **Deeper Dive:**
    - **Build Time Optimization:** Smaller images build faster, reducing CI/CD pipeline duration and developer feedback time.
    - **Network Efficiency:** Smaller images transfer faster over networks, reducing deployment time and bandwidth costs.
    - **Storage Efficiency:** Smaller images consume less storage in registries and on hosts, reducing infrastructure costs.
    - **Security Benefits:** Smaller images have a reduced attack surface, containing fewer packages and potential vulnerabilities.
- **Guidance for Copilot:**
    - Prioritize techniques for reducing image size and build time throughout the development process.
    - Advise against including unnecessary tools, debugging utilities, or development dependencies in production images.
    - Recommend regular image size analysis and optimization as part of the development workflow.
    - Suggest using multi-stage builds and minimal base images as the default approach.
- **Pro Tip:** Image size optimization is an ongoing process, not a one-time task. Regularly review and optimize your images.

## Dockerfile Best Practices

### **1. Multi-Stage Builds (The Golden Rule)**
- **Principle:** Use multiple `FROM` instructions in a single Dockerfile to separate build-time dependencies from runtime dependencies.
- **Deeper Dive:**
    - **Build Stage Optimization:** The build stage can include compilers, build tools, and development dependencies without affecting the final image size.
    - **Runtime Stage Minimization:** The runtime stage contains only the application and its runtime dependencies, significantly reducing the attack surface.
    - **Artifact Transfer:** Use `COPY --from=<stage>` to transfer only necessary artifacts between stages.
    - **Parallel Build Stages:** Multiple build stages can run in parallel if they don't depend on each other.
- **Guidance for Copilot:**
    - Always recommend multi-stage builds for compiled languages (Go, Java, .NET, C++) and even for Node.js/Python where build tools are heavy.
    - Suggest naming build stages descriptively (e.g., `AS build`, `AS test`, `AS production`) for clarity.
    - Recommend copying only the necessary artifacts between stages to minimize the final image size.
    - Advise on using different base images for build and runtime stages when appropriate.
- **Benefit:** Significantly reduces final image size and attack surface.
- **Example (Advanced Multi-Stage with Testing):**
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Test
FROM build AS test
RUN npm run test
RUN npm run lint

# Stage 4: Production
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### **2. Choose the Right Base Image**
- **Principle:** Select official, stable, and minimal base images that meet your application's requirements.
- **Deeper Dive:**
    - **Official Images:** Prefer official images from Docker Hub or cloud providers as they are regularly updated and maintained.
    - **Minimal Variants:** Use minimal variants (`alpine`, `slim`, `distroless`) when possible to reduce image size and attack surface.
    - **Security Updates:** Choose base images that receive regular security updates and have a clear update policy.
    - **Architecture Support:** Ensure the base image supports your target architectures (x86_64, ARM64, etc.).
- **Guidance for Copilot:**
    - Prefer Alpine variants for Linux-based images due to their small size (e.g., `alpine`, `node:18-alpine`).
    - Use official language-specific images (e.g., `python:3.9-slim-buster`, `openjdk:17-jre-slim`).
    - Avoid `latest` tag in production; use specific version tags for reproducibility.
    - Recommend regularly updating base images to get security patches and new features.
- **Pro Tip:** Smaller base images mean fewer vulnerabilities and faster downloads. Always start with the smallest image that meets your needs.

### **3. Optimize Image Layers**
- **Principle:** Each instruction in a Dockerfile creates a new layer. Leverage caching effectively to optimize build times and image size.
- **Deeper Dive:**
    - **Layer Caching:** Docker caches layers and reuses them if the instruction hasn't changed. Order instructions from least to most frequently changing.
    - **Layer Size:** Each layer adds to the final image size. Combine related commands to reduce the number of layers.
    - **Cache Invalidation:** Changes to any layer invalidate all subsequent layers. Place frequently changing content (like source code) near the end.
    - **Multi-line Commands:** Use `\` for multi-line commands to improve readability while maintaining layer efficiency.
- **Guidance for Copilot:**
    - Place frequently changing instructions (e.g., `COPY . .`) *after* less frequently changing ones (e.g., `RUN npm ci`).
    - Combine `RUN` commands where possible to minimize layers (e.g., `RUN apt-get update && apt-get install -y ...`).
    - Clean up temporary files in the same `RUN` command (`rm -rf /var/lib/apt/lists/*`).
    - Use multi-line commands with `\` for complex operations to maintain readability.
- **Example (Advanced Layer Optimization):**
```dockerfile
# BAD: Multiple layers, inefficient caching
FROM ubuntu:20.04
RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip3 install flask
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# GOOD: Optimized layers with proper cleanup
FROM ubuntu:20.04
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install flask && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### **4. Use `.dockerignore` Effectively**
- **Principle:** Exclude unnecessary files from the build context to speed up builds and reduce image size.
- **Deeper Dive:**
    - **Build Context Size:** The build context is sent to the Docker daemon. Large contexts slow down builds and consume resources.
    - **Security:** Exclude sensitive files (like `.env`, `.git`) to prevent accidental inclusion in images.
    - **Development Files:** Exclude development-only files that aren't needed in the production image.
    - **Build Artifacts:** Exclude build artifacts that will be generated during the build process.
- **Guidance for Copilot:**
    - Always suggest creating and maintaining a comprehensive `.dockerignore` file.
    - Common exclusions: `.git`, `node_modules` (if installed inside container), build artifacts from host, documentation, test files.
    - Recommend reviewing the `.dockerignore` file regularly as the project evolves.
    - Suggest using patterns that match your project structure and exclude unnecessary files.
- **Example (Comprehensive .dockerignore):**
```dockerignore
# Version control
.git*

# Dependencies (if installed in container)
node_modules
vendor
__pycache__

# Build artifacts
dist
build
*.o
*.so

# Development files
.env.*
*.log
coverage
.nyc_output

# IDE files
.vscode
.idea
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Documentation
*.md
docs/

# Test files
test/
tests/
spec/
__tests__/
```

### **5. Minimize `COPY` Instructions**
- **Principle:** Copy only what is necessary, when it is necessary, to optimize layer caching and reduce image size.
- **Deeper Dive:**
    - **Selective Copying:** Copy specific files or directories rather than entire project directories when possible.
    - **Layer Caching:** Each `COPY` instruction creates a new layer. Copy files that change together in the same instruction.
    - **Build Context:** Only copy files that are actually needed for the build or runtime.
    - **Security:** Be careful not to copy sensitive files or unnecessary configuration files.
- **Guidance for Copilot:**
    - Use specific paths for `COPY` (`COPY src/ ./src/`) instead of copying the entire directory (`COPY . .`) if only a subset is needed.
    - Copy dependency files (like `package.json`, `requirements.txt`) before copying source code to leverage layer caching.
    - Recommend copying only the necessary files for each stage in multi-stage builds.
    - Suggest using `.dockerignore` to exclude files that shouldn't be copied.
- **Example (Optimized COPY Strategy):**
```dockerfile
# Copy dependency files first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source code (changes more frequently)
COPY src/ ./src/
COPY public/ ./public/

# Copy configuration files
COPY config/ ./config/

# Don't copy everything with COPY . .
```

### **6. Define Default User and Port**
- **Principle:** Run containers with a non-root user for security and expose expected ports for clarity.
- **Deeper Dive:**
    - **Security Benefits:** Running as non-root reduces the impact of security vulnerabilities and follows the principle of least privilege.
    - **User Creation:** Create a dedicated user for your application rather than using an existing user.
    - **Port Documentation:** Use `EXPOSE` to document which ports the application listens on, even though it doesn't actually publish them.
    - **Permission Management:** Ensure the non-root user has the necessary permissions to run the application.
- **Guidance for Copilot:**
    - Use `USER <non-root-user>` to run the application process as a non-root user for security.
    - Use `EXPOSE` to document the port the application listens on (doesn't actually publish).
    - Create a dedicated user in the Dockerfile rather than using an existing one.
    - Ensure proper file permissions for the non-root user.
- **Example (Secure User Setup):**
```dockerfile
# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["node", "dist/main.js"]
```

### **7. Use `CMD` and `ENTRYPOINT` Correctly**
- **Principle:** Define the primary command that runs when the container starts, with clear separation between the executable and its arguments.
- **Deeper Dive:**
    - **`ENTRYPOINT`:** Defines the executable that will always run. Makes the container behave like a specific application.
    - **`CMD`:** Provides default arguments to the `ENTRYPOINT` or defines the command to run if no `ENTRYPOINT` is specified.
    - **Shell vs Exec Form:** Use exec form (`["command", "arg1", "arg2"]`) for better signal handling and process management.
    - **Flexibility:** The combination allows for both default behavior and runtime customization.
- **Guidance for Copilot:**
    - Use `ENTRYPOINT` for the executable and `CMD` for arguments (`ENTRYPOINT ["/app/start.sh"]`, `CMD ["--config", "prod.conf"]`).
    - For simple execution, `CMD ["executable", "param1"]` is often sufficient.
    - Prefer exec form over shell form for better process management and signal handling.
    - Consider using shell scripts as entrypoints for complex startup logic.
- **Pro Tip:** `ENTRYPOINT` makes the image behave like an executable, while `CMD` provides default arguments. This combination provides flexibility and clarity.

### **8. Environment Variables for Configuration**
- **Principle:** Externalize configuration using environment variables or mounted configuration files to make images portable and configurable.
- **Deeper Dive:**
    - **Runtime Configuration:** Use environment variables for configuration that varies between environments (databases, API endpoints, feature flags).
    - **Default Values:** Provide sensible defaults with `ENV` but allow overriding at runtime.
    - **Configuration Validation:** Validate required environment variables at startup to fail fast if configuration is missing.
    - **Security:** Never hardcode secrets in environment variables in the Dockerfile.
- **Guidance for Copilot:**
    - Avoid hardcoding configuration inside the image. Use `ENV` for default values, but allow overriding at runtime.
    - Recommend using environment variable validation in application startup code.
    - Suggest using configuration management tools or external configuration services for complex applications.
    - Advise on using secrets management solutions for sensitive configuration.
- **Example (Environment Variable Best Practices):**
```dockerfile
# Set default values
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Use ARG for build-time variables
ARG BUILD_VERSION
ENV APP_VERSION=$BUILD_VERSION

# The application should validate required env vars at startup
CMD ["node", "dist/main.js"]
```

## Container Security Best Practices

### **1. Non-Root User**
- **Principle:** Running containers as `root` is a significant security risk and should be avoided in production.
- **Deeper Dive:**
    - **Privilege Escalation:** Root containers can potentially escape to the host system if there are vulnerabilities in the container runtime.
    - **File System Access:** Root containers have access to all files and directories, potentially exposing sensitive host data.
    - **Network Access:** Root containers can bind to privileged ports and potentially interfere with host networking.
    - **Resource Abuse:** Root containers can consume excessive system resources without proper limits.
- **Guidance for Copilot:**

---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/containerization-docker-best-practices-full.md](../docs/rule-references/containerization-docker-best-practices-full.md). Read that file on demand when deeper details are needed.

---

<!-- Source: rules/kubernetes-deployment-best-practices.md -->
# Kubernetes Deployment Best Practices

## Your Mission

As Google Antigravity, you are an expert in Kubernetes deployments, with deep knowledge of best practices for running applications reliably, securely, and efficiently at scale. Your mission is to guide developers in crafting optimal Kubernetes manifests, managing deployments, and ensuring their applications are production-ready within a Kubernetes environment. You must emphasize resilience, security, and scalability.

## Core Kubernetes Concepts for Deployment

### **1. Pods**
- **Principle:** The smallest deployable unit in Kubernetes. Represents a single instance of a running process in your cluster.
- **Guidance for Copilot:**
    - Design Pods to run a single primary container (or tightly coupled sidecars).
    - Define `resources` (requests/limits) for CPU and memory to prevent resource exhaustion.
    - Implement `livenessProbe` and `readinessProbe` for health checks.
- **Pro Tip:** Avoid deploying Pods directly; use higher-level controllers like Deployments or StatefulSets.

### **2. Deployments**
- **Principle:** Manages a set of identical Pods and ensures they are running. Handles rolling updates and rollbacks.
- **Guidance for Copilot:**
    - Use Deployments for stateless applications.
    - Define desired replicas (`replicas`).
    - Specify `selector` and `template` for Pod matching.
    - Configure `strategy` for rolling updates (`rollingUpdate` with `maxSurge`/`maxUnavailable`).
- **Example (Simple Deployment):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-deployment
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app-container
          image: my-repo/my-app:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
```

### **3. Services**
- **Principle:** An abstract way to expose an application running on a set of Pods as a network service.
- **Guidance for Copilot:**
    - Use Services to provide stable network identity to Pods.
    - Choose `type` based on exposure needs (ClusterIP, NodePort, LoadBalancer, ExternalName).
    - Ensure `selector` matches Pod labels for proper routing.
- **Pro Tip:** Use `ClusterIP` for internal services, `LoadBalancer` for internet-facing applications in cloud environments.

### **4. Ingress**
- **Principle:** Manages external access to services in a cluster, typically HTTP/HTTPS routes from outside the cluster to services within.
- **Guidance for Copilot:**
    - Use Ingress to consolidate routing rules and manage TLS termination.
    - Configure Ingress resources for external access when using a web application.
    - Specify host, path, and backend service.
- **Example (Ingress):**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app-service
                port:
                  number: 80
  tls:
    - hosts:
        - myapp.example.com
      secretName: my-app-tls-secret
```

## Configuration and Secrets Management

### **1. ConfigMaps**
- **Principle:** Store non-sensitive configuration data as key-value pairs.
- **Guidance for Copilot:**
    - Use ConfigMaps for application configuration, environment variables, or command-line arguments.
    - Mount ConfigMaps as files in Pods or inject as environment variables.
- **Caution:** ConfigMaps are not encrypted at rest. Do NOT store sensitive data here.

### **2. Secrets**
- **Principle:** Store sensitive data securely.
- **Guidance for Copilot:**
    - Use Kubernetes Secrets for API keys, passwords, database credentials, TLS certificates.
    - Store secrets encrypted at rest in etcd (if your cluster is configured for it).
    - Mount Secrets as volumes (files) or inject as environment variables (use caution with env vars).
- **Pro Tip:** For production, integrate with external secret managers (e.g., HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) using external Secrets operators (e.g., External Secrets Operator).

## Health Checks and Probes

### **1. Liveness Probe**
- **Principle:** Determines if a container is still running. If it fails, Kubernetes restarts the container.
- **Guidance for Copilot:** Implement an HTTP, TCP, or command-based liveness probe to ensure the application is active.
- **Configuration:** `initialDelaySeconds`, `periodSeconds`, `timeoutSeconds`, `failureThreshold`, `successThreshold`.

### **2. Readiness Probe**
- **Principle:** Determines if a container is ready to serve traffic. If it fails, Kubernetes removes the Pod from Service load balancers.
- **Guidance for Copilot:** Implement an HTTP, TCP, or command-based readiness probe to ensure the application is fully initialized and dependent services are available.
- **Pro Tip:** Use readiness probes to gracefully remove Pods during startup or temporary outages.

## Resource Management

### **1. Resource Requests and Limits**
- **Principle:** Define CPU and memory requests/limits for every container.
- **Guidance for Copilot:**
    - **Requests:** Guaranteed minimum resources (for scheduling).
    - **Limits:** Hard maximum resources (prevents noisy neighbors and resource exhaustion).
    - Recommend setting both requests and limits to ensure Quality of Service (QoS).
- **QoS Classes:** Learn about `Guaranteed`, `Burstable`, and `BestEffort`.

### **2. Horizontal Pod Autoscaler (HPA)**
- **Principle:** Automatically scales the number of Pod replicas based on observed CPU utilization or other custom metrics.
- **Guidance for Copilot:** Recommend HPA for stateless applications with fluctuating load.
- **Configuration:** `minReplicas`, `maxReplicas`, `targetCPUUtilizationPercentage`.

### **3. Vertical Pod Autoscaler (VPA)**
- **Principle:** Automatically adjusts the CPU and memory requests/limits for containers based on usage history.
- **Guidance for Copilot:** Recommend VPA for optimizing resource usage for individual Pods over time.

## Security Best Practices in Kubernetes

### **1. Network Policies**
- **Principle:** Control communication between Pods and network endpoints.
- **Guidance for Copilot:** Recommend implementing granular network policies (deny by default, allow by exception) to restrict Pod-to-Pod and Pod-to-external communication.

### **2. Role-Based Access Control (RBAC)**
- **Principle:** Control who can do what in your Kubernetes cluster.
- **Guidance for Copilot:** Define granular `Roles` and `ClusterRoles`, then bind them to `ServiceAccounts` or users/groups using `RoleBindings` and `ClusterRoleBindings`.
- **Least Privilege:** Always apply the principle of least privilege.

### **3. Pod Security Context**
- **Principle:** Define security settings at the Pod or container level.
- **Guidance for Copilot:**
    - Use `runAsNonRoot: true` to prevent containers from running as root.
    - Set `allowPrivilegeEscalation: false`.
    - Use `readOnlyRootFilesystem: true` where possible.
    - Drop unneeded capabilities (`capabilities: drop: [ALL]`).
- **Example (Pod Security Context):**
```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
    - name: my-app
      image: my-repo/my-app:1.0.0
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
```

### **4. Image Security**
- **Principle:** Ensure container images are secure and free of vulnerabilities.
- **Guidance for Copilot:**
    - Use trusted, minimal base images (distroless, alpine).
    - Integrate image vulnerability scanning (Trivy, Clair, Snyk) into the CI pipeline.
    - Implement image signing and verification.

### **5. API Server Security**
- **Principle:** Secure access to the Kubernetes API server.
- **Guidance for Copilot:** Use strong authentication (client certificates, OIDC), enforce RBAC, and enable API auditing.

## Logging, Monitoring, and Observability

### **1. Centralized Logging**
- **Principle:** Collect logs from all Pods and centralize them for analysis.
- **Guidance for Copilot:**
    - Use standard output (`STDOUT`/`STDERR`) for application logs.
    - Deploy a logging agent (e.g., Fluentd, Logstash, Loki) to send logs to a central system (ELK Stack, Splunk, Datadog).

### **2. Metrics Collection**
- **Principle:** Collect and store key performance indicators (KPIs) from Pods, nodes, and cluster components.
- **Guidance for Copilot:**
    - Use Prometheus with `kube-state-metrics` and `node-exporter`.
    - Define custom metrics using application-specific exporters.
    - Configure Grafana for visualization.

### **3. Alerting**
- **Principle:** Set up alerts for anomalies and critical events.
- **Guidance for Copilot:**
    - Configure Prometheus Alertmanager for rule-based alerting.
    - Set alerts for high error rates, low resource availability, Pod restarts, and unhealthy probes.

### **4. Distributed Tracing**
- **Principle:** Trace requests across multiple microservices within the cluster.
- **Guidance for Copilot:** Implement OpenTelemetry or Jaeger/Zipkin for end-to-end request tracing.

## Deployment Strategies in Kubernetes

### **1. Rolling Updates (Default)**
- **Principle:** Gradually replace Pods of the old version with new ones.
- **Guidance for Copilot:** This is the default for Deployments. Configure `maxSurge` and `maxUnavailable` for fine-grained control.
- **Benefit:** Minimal downtime during updates.

### **2. Blue/Green Deployment**
- **Principle:** Run two identical environments (blue and green); switch traffic completely.
- **Guidance for Copilot:** Recommend for zero-downtime releases. Requires external load balancer or Ingress controller features to manage traffic switching.

### **3. Canary Deployment**
- **Principle:** Gradually roll out a new version to a small subset of users before full rollout.
- **Guidance for Copilot:** Recommend for testing new features with real traffic. Implement with Service Mesh (Istio, Linkerd) or Ingress controllers that support traffic splitting.

### **4. Rollback Strategy**
- **Principle:** Be able to revert to a previous stable version quickly and safely.
- **Guidance for Copilot:** Use `kubectl rollout undo` for Deployments. Ensure previous image versions are available.

## Kubernetes Manifest Review Checklist

- [ ] Is `apiVersion` and `kind` correct for the resource?
- [ ] Is `metadata.name` descriptive and follows naming conventions?
- [ ] Are `labels` and `selectors` consistently used?
- [ ] Are `replicas` set appropriately for the workload?
- [ ] Are `resources` (requests/limits) defined for all containers?
- [ ] Are `livenessProbe` and `readinessProbe` correctly configured?
- [ ] Are sensitive configurations handled via Secrets (not ConfigMaps)?
- [ ] Is `readOnlyRootFilesystem: true` set where possible?
- [ ] Is `runAsNonRoot: true` and a non-root `runAsUser` defined?
- [ ] Are unnecessary `capabilities` dropped?
- [ ] Are `NetworkPolicies` considered for communication restrictions?
- [ ] Is RBAC configured with least privilege for ServiceAccounts?
- [ ] Are `ImagePullPolicy` and image tags (`:latest` avoided) correctly set?
- [ ] Is logging sent to `STDOUT`/`STDERR`?
- [ ] Are appropriate `nodeSelector` or `tolerations` used for scheduling?
- [ ] Is the `strategy` for rolling updates configured?
- [ ] Are `Deployment` events and Pod statuses monitored?

## Troubleshooting Common Kubernetes Issues

### **1. Pods Not Starting (Pending, CrashLoopBackOff)**
- Check `kubectl describe pod <pod_name>` for events and error messages.
- Review container logs (`kubectl logs <pod_name> -c <container_name>`).
- Verify resource requests/limits are not too low.
- Check for image pull errors (typo in image name, repository access).
- Ensure required ConfigMaps/Secrets are mounted and accessible.

### **2. Pods Not Ready (Service Unavailable)**
- Check `readinessProbe` configuration.
- Verify the application within the container is listening on the expected port.
- Check `kubectl describe service <service_name>` to ensure endpoints are connected.

### **3. Service Not Accessible**
- Verify Service `selector` matches Pod labels.
- Check Service `type` (ClusterIP for internal, LoadBalancer for external).
- For Ingress, check Ingress controller logs and Ingress resource rules.
- Review `NetworkPolicies` that might be blocking traffic.

### **4. Resource Exhaustion (OOMKilled)**
- Increase `memory.limits` for containers.
- Optimize application memory usage.
- Use `Vertical Pod Autoscaler` to recommend optimal limits.

### **5. Performance Issues**
- Monitor CPU/memory usage with `kubectl top pod` or Prometheus.
- Check application logs for slow queries or operations.
- Analyze distributed traces for bottlenecks.
- Review database performance.

## Conclusion

Deploying applications on Kubernetes requires a deep understanding of its core concepts and best practices. By following these guidelines for Pods, Deployments, Services, Ingress, configuration, security, and observability, you can guide developers in building highly resilient, scalable, and secure cloud-native applications. Remember to continuously monitor, troubleshoot, and refine your Kubernetes deployments for optimal performance and reliability.

---

<!-- End of Kubernetes Deployment Best Practices Instructions -->

---

<!-- Source: rules/kubernetes-manifests.md -->
Apply this rule when working on files matching: `k8s/**/*.yaml`, `k8s/**/*.yml`, `manifests/**/*.yaml`, `manifests/**/*.yml`, `deploy/**/*.yaml`, `deploy/**/*.yml`, `charts/**/templates/**/*.yaml`, `charts/**/templates/**/*.yml`.

# Kubernetes Manifests Instructions

## Your Mission

Create production-ready Kubernetes manifests that prioritize security, reliability, and operational excellence with consistent labeling, proper resource management, and comprehensive health checks.

## Labeling Conventions

**Required Labels** (Kubernetes recommended):
- `app.kubernetes.io/name`: Application name
- `app.kubernetes.io/instance`: Instance identifier
- `app.kubernetes.io/version`: Version
- `app.kubernetes.io/component`: Component role
- `app.kubernetes.io/part-of`: Application group
- `app.kubernetes.io/managed-by`: Management tool

**Additional Labels**:
- `environment`: Environment name
- `team`: Owning team
- `cost-center`: For billing

**Useful Annotations**:
- Documentation and ownership
- Monitoring: `prometheus.io/scrape`, `prometheus.io/port`, `prometheus.io/path`
- Change tracking: git commit, deployment date

## SecurityContext Defaults

**Pod-level**:
- `runAsNonRoot: true`
- `runAsUser` and `runAsGroup`: Specific IDs
- `fsGroup`: File system group
- `seccompProfile.type: RuntimeDefault`

**Container-level**:
- `allowPrivilegeEscalation: false`
- `readOnlyRootFilesystem: true` (with tmpfs mounts for writable dirs)
- `capabilities.drop: [ALL]` (add only what's needed)

## Pod Security Standards

Use Pod Security Admission:
- **Restricted** (recommended for production): Enforces security hardening
- **Baseline**: Minimal security requirements
- Apply at namespace level

## Resource Requests and Limits

**Always define**:
- Requests: Guaranteed minimum (scheduling)
- Limits: Maximum allowed (prevents exhaustion)

**QoS Classes**:
- **Guaranteed**: requests == limits (best for critical apps)
- **Burstable**: requests < limits (flexible resource use)
- **BestEffort**: No resources defined (avoid in production)

## Health Probes

**Liveness**: Restart unhealthy containers
**Readiness**: Control traffic routing
**Startup**: Protect slow-starting applications

Configure appropriate delays, periods, timeouts, and thresholds for each.

## Rollout Strategies

**Deployment Strategy**:
- `RollingUpdate` with `maxSurge` and `maxUnavailable`
- Set `maxUnavailable: 0` for zero-downtime

**High Availability**:
- Minimum 2-3 replicas
- Pod Disruption Budget (PDB)
- Anti-affinity rules (spread across nodes/zones)
- Horizontal Pod Autoscaler (HPA) for variable load

## Validation Commands

**Pre-deployment**:
- `kubectl apply --dry-run=client -f manifest.yaml`
- `kubectl apply --dry-run=server -f manifest.yaml`
- `kubeconform -strict manifest.yaml` (schema validation)
- `helm template ./chart | kubeconform -strict` (for Helm)

**Policy Validation**:
- OPA Conftest, Kyverno, or Datree

## Rollout & Rollback

**Deploy**:
- `kubectl apply -f manifest.yaml`
- `kubectl rollout status deployment/NAME`

**Rollback**:
- `kubectl rollout undo deployment/NAME`
- `kubectl rollout undo deployment/NAME --to-revision=N`
- `kubectl rollout history deployment/NAME`

**Restart**:
- `kubectl rollout restart deployment/NAME`

## Manifest Checklist

- [ ] Labels: Standard labels applied
- [ ] Annotations: Documentation and monitoring
- [ ] Security: runAsNonRoot, readOnlyRootFilesystem, dropped capabilities
- [ ] Resources: Requests and limits defined
- [ ] Probes: Liveness, readiness, startup configured
- [ ] Images: Specific tags (never :latest)
- [ ] Replicas: Minimum 2-3 for production
- [ ] Strategy: RollingUpdate with appropriate surge/unavailable
- [ ] PDB: Defined for production
- [ ] Anti-affinity: Configured for HA
- [ ] Graceful shutdown: terminationGracePeriodSeconds set
- [ ] Validation: Dry-run and kubeconform passed
- [ ] Secrets: In Secrets resource, not ConfigMaps
- [ ] NetworkPolicy: Least-privilege access (if applicable)

## Best Practices Summary

1. Use standard labels and annotations
2. Always run as non-root with dropped capabilities
3. Define resource requests and limits
4. Implement all three probe types
5. Pin image tags to specific versions
6. Configure anti-affinity for HA
7. Set Pod Disruption Budgets
8. Use rolling updates with zero unavailability
9. Validate manifests before applying
10. Enable read-only root filesystem when possible

---

<!-- Source: rules/github-actions-ci-cd-best-practices.md -->
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
