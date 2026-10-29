---
trigger: model_decision
description: Comprehensive guide for migrating Spring Boot applications from 3.x to 4.0, focusing on Gradle Kotlin DSL and version catalogs. Applies to files matching **/*.java, **/*.kt, **/build.gradle.kts, **/build.gradle, **/settings.gradle.kts, **/gradle/libs.versions.toml, **/*.properties, **/*.yml, **/*.yaml.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/springboot-4-migration.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: shane lee
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.java`, `**/*.kt`, `**/build.gradle.kts`, `**/build.gradle`, `**/settings.gradle.kts`, `**/gradle/libs.versions.toml`, `**/*.properties`, `**/*.yml`, `**/*.yaml`.

# Spring Boot 3.x to 4.0 Migration Guide

## Project Context

This guide provides comprehensive Google Antigravity instructions for upgrading Spring Boot projects from version 3.x to 4.0, with emphasis on Gradle Kotlin DSL, version catalogs (`libs.versions.toml`), and Kotlin-specific considerations.

**Key architectural changes in Spring Boot 4.0:**
- Modular dependency structure with focused, smaller modules
- Spring Framework 7.x required
- Jakarta EE 11 (Servlet 6.1 baseline)
- Jackson 3.x migration (package namespace changes)
- Kotlin 2.2+ requirement
- Comprehensive property reorganization

## System Requirements

### Minimum Versions

- **Java**: 17+ (prefer latest LTS: Java 21 or 25)
- **Kotlin**: 2.2.0 or later
- **Spring Framework**: 7.x (managed by Spring Boot 4.0)
- **Jakarta EE**: 11 (Servlet 6.1 baseline)
- **GraalVM** (for native images): 25+
- **Gradle**: 8.5+ (for Kotlin DSL and version catalog support)
- **Gradle CycloneDX Plugin**: 3.0.0+

### Verify Compatibility

```bash
# Check current versions
./gradlew --version
./gradlew dependencies --configuration runtimeClasspath
```

## Pre-Migration Steps

### 1. Upgrade to Latest Spring Boot 3.5.x

Before migrating to 4.0, upgrade to the latest 3.5.x release:

```kotlin
// libs.versions.toml
[versions]
springBoot = "3.5.6" # Latest 3.x before migrating to 4.0
```

### 2. Clean Up Deprecations

Remove all deprecated API usage from Spring Boot 3.x. These will be compilation errors in 4.0:

```bash
# Build and review warnings
./gradlew clean build --warning-mode all
```

### 3. Review Dependency Changes

Compare your dependencies against:
- [Spring Boot 3.5.x Dependency Versions](https://docs.spring.io/spring-boot/3.5/appendix/dependency-versions/coordinates.html)
- [Spring Boot 4.0.x Dependency Versions](https://docs.spring.io/spring-boot/4.0/appendix/dependency-versions/coordinates.html)

## Module Restructuring and Starter Changes

### Critical: Modular Architecture

Spring Boot 4.0 introduces **smaller, focused modules** replacing large monolithic jars. This requires dependency updates in most projects.

**Important for Library Authors:** Due to the modularization effort and package reorganization, **supporting both Spring Boot 3 and Spring Boot 4 within the same artifact is strongly discouraged**. Library authors should publish separate artifacts for each major version to avoid runtime conflicts and ensure clean dependency management.

### Migration Strategy: Choose One Approach

#### Option 1: Technology-Specific Starters (Recommended for Production)

Most technologies covered by Spring Boot now have **dedicated test starter companions**. This provides fine-grained control.

**Complete Starter Reference:** For comprehensive tables of all available starters (Core, Web, Database, Spring Data, Messaging, Security, Templating, Production-Ready, etc.) and their test companions, refer to the [official Spring Boot 4.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide#starters).

**libs.versions.toml:**
```toml
[versions]
springBoot = "4.0.0"

[libraries]
# Core starters with dedicated test modules
spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-webmvc", version.ref = "springBoot" }
spring-boot-starter-webmvc-test = { module = "org.springframework.boot:spring-boot-starter-webmvc-test", version.ref = "springBoot" }

spring-boot-starter-data-jpa = { module = "org.springframework.boot:spring-boot-starter-data-jpa", version.ref = "springBoot" }
spring-boot-starter-data-jpa-test = { module = "org.springframework.boot:spring-boot-starter-data-jpa-test", version.ref = "springBoot" }

spring-boot-starter-security = { module = "org.springframework.boot:spring-boot-starter-security", version.ref = "springBoot" }
spring-boot-starter-security-test = { module = "org.springframework.boot:spring-boot-starter-security-test", version.ref = "springBoot" }
```

**build.gradle.kts:**
```kotlin
dependencies {
    implementation(libs.spring.boot.starter.webmvc)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.security)

    testImplementation(libs.spring.boot.starter.webmvc.test)
    testImplementation(libs.spring.boot.starter.data.jpa.test)
    testImplementation(libs.spring.boot.starter.security.test)
}
```

#### Option 2: Classic Starters (Quick Migration, Deprecated)

For rapid migration, use **classic starters** that bundle all auto-configuration (like Spring Boot 3.x):

**libs.versions.toml:**
```toml
[libraries]
spring-boot-starter-classic = { module = "org.springframework.boot:spring-boot-starter-classic", version.ref = "springBoot" }
spring-boot-starter-test-classic = { module = "org.springframework.boot:spring-boot-starter-test-classic", version.ref = "springBoot" }
```

**build.gradle.kts:**
```kotlin
dependencies {
    implementation(libs.spring.boot.starter.classic)
    testImplementation(libs.spring.boot.starter.test.classic)
}
```

**Warning**: Classic starters are **deprecated** and will be removed in future releases. Plan migration to technology-specific starters.

#### Option 3: Direct Module Dependencies (Advanced)

For explicit control over transitive dependencies:

**libs.versions.toml:**
```toml
[libraries]
spring-boot-webmvc = { module = "org.springframework.boot:spring-boot-webmvc", version.ref = "springBoot" }
spring-boot-webmvc-test = { module = "org.springframework.boot:spring-boot-webmvc-test", version.ref = "springBoot" }
```

### Renamed Starters (Breaking Changes)

Update these starter names in your `libs.versions.toml`:

| Spring Boot 3.x | Spring Boot 4.0 | Notes |
|----------------|-----------------|-------|
| `spring-boot-starter-web` | `spring-boot-starter-webmvc` | Explicit naming |
| `spring-boot-starter-web-services` | `spring-boot-starter-webservices` | Hyphen removed |
| `spring-boot-starter-aop` | `spring-boot-starter-aspectj` | Only needed if using `org.aspectj.lang.annotation` |
| `spring-boot-starter-oauth2-authorization-server` | `spring-boot-starter-security-oauth2-authorization-server` | Security namespace |
| `spring-boot-starter-oauth2-client` | `spring-boot-starter-security-oauth2-client` | Security namespace |
| `spring-boot-starter-oauth2-resource-server` | `spring-boot-starter-security-oauth2-resource-server` | Security namespace |

**Migration Example (libs.versions.toml):**
```toml
[libraries]
# Old (Spring Boot 3.x)
# spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-web", version.ref = "springBoot" }
# spring-boot-starter-oauth2-client = { module = "org.springframework.boot:spring-boot-starter-oauth2-client", version.ref = "springBoot" }

# New (Spring Boot 4.0)
spring-boot-starter-webmvc = { module = "org.springframework.boot:spring-boot-starter-webmvc", version.ref = "springBoot" }
spring-boot-starter-security-oauth2-client = { module = "org.springframework.boot:spring-boot-starter-security-oauth2-client", version.ref = "springBoot" }
```

### AspectJ Starter Clarification

Only include `spring-boot-starter-aspectj` if you're **actually using AspectJ annotations**:

```kotlin
// Only needed if code uses org.aspectj.lang.annotation package
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Before

@Aspect
class MyAspect {
    @Before("execution(* com.example..*(..))")
    fun beforeAdvice() { }
}
```

If not using AspectJ, remove the dependency.

## Removed Features and Alternatives

### Embedded Servers

#### Undertow Removed

**Undertow is completely removed** - not compatible with Servlet 6.1 baseline.

**Migration:**
- Use **Tomcat** (default) or **Jetty**
- Do **not** deploy Spring Boot 4.0 apps to non-Servlet 6.1 containers

**libs.versions.toml:**
```toml
[libraries]
# Remove Undertow
# spring-boot-starter-undertow = { module = "org.springframework.boot:spring-boot-starter-undertow", version.ref = "springBoot" }

# Use Tomcat (default) or Jetty
spring-boot-starter-jetty = { module = "org.springframework.boot:spring-boot-starter-jetty", version.ref = "springBoot" }
```

**build.gradle.kts:**
```kotlin
dependencies {
    implementation(libs.spring.boot.starter.webmvc) {
        exclude(group = "org.springframework.boot", module = "spring-boot-starter-tomcat")
    }
    implementation(libs.spring.boot.starter.jetty) // Alternative to Tomcat
}
```

### Session Management

#### Spring Session Hazelcast and MongoDB Removed

**Maintained by respective teams**, no longer in Spring Boot dependency management.

**Migration (libs.versions.toml):**
```toml
[versions]
hazelcast-spring-session = "3.x.x" # Check Hazelcast documentation
mongodb-spring-session = "4.x.x"   # Check MongoDB documentation

[libraries]
# Explicit versions required
spring-session-hazelcast = { module = "com.hazelcast:spring-session-hazelcast", version.ref = "hazelcast-spring-session" }
spring-session-mongodb = { module = "org.springframework.session:spring-session-data-mongodb", version.ref = "mongodb-spring-session" }
```

### Reactive Messaging

#### Pulsar Reactive Removed

Spring Pulsar dropped Reactor support - reactive Pulsar client removed.

**Migration:**
- Use imperative Pulsar client
- Or migrate to alternative reactive messaging (Kafka, RabbitMQ)

### Testing

#### Spock Framework Removed

**Spock does not yet support Groovy 5** (required for Spring Boot 4.0).

**Migration:**
- Use JUnit 5 with Kotlin
- Or wait for Spock Groovy 5 compatibility

### Build Features

#### Executable Jar Launch Scripts Removed

Embedded launch scripts for "fully executable" jars removed (Unix-specific, limited use).

**build.gradle.kts (remove):**
```kotlin
// Remove this configuration
tasks.bootJar {
    launchScript() // No longer supported
}
```

**Alternatives:**
- Use `java -jar app.jar` directly
- Use Gradle Application Plugin for native launchers
- Use systemd service files

#### Classic Uber-Jar Loader Removed

The classic uber-jar loader has been removed. Remove any loader implementation configuration from your build.

**Maven (pom.xml) - remove:**
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <loaderImplementation>CLASSIC</loaderImplementation> <!-- REMOVE THIS -->
            </configuration>
        </plugin>
    </plugins>
</build>
```

**Gradle (build.gradle.kts) - remove:**
```kotlin
tasks.bootJar {
    loaderImplementation = org.springframework.boot.loader.tools.LoaderImplementation.CLASSIC // REMOVE THIS
}
```

## Jackson 3 Migration

### Major Breaking Change: Package Namespace

Jackson 3 changes **group ID and package names**:

| Component | Old (Jackson 2) | New (Jackson 3) |
|-----------|----------------|-----------------|
| Group ID | `com.fasterxml.jackson` | `tools.jackson` |
| Packages | `com.fasterxml.jackson.*` | `tools.jackson.*` |
| Exception | `jackson-annotations` | Still uses `com.fasterxml.jackson.core` group |

**libs.versions.toml:**
```toml
[versions]
jackson = "3.0.1" # Managed by Spring Boot 4.0

[libraries]
# Jackson 3 uses new group ID
jackson-databind = { module = "tools.jackson.core:jackson-databind", version.ref = "jackson" }
jackson-module-kotlin = { module = "tools.jackson.module:jackson-module-kotlin", version.ref = "jackson" }

# Exception: annotations still use old group
jackson-annotations = { module = "com.fasterxml.jackson.core:jackson-annotations", version.ref = "jackson" }
```

### Class and Annotation Renames

Update imports and annotations:

| Spring Boot 3.x | Spring Boot 4.0 |
|----------------|-----------------|
| `Jackson2ObjectMapperBuilderCustomizer` | `JsonMapperBuilderCustomizer` |
| `JsonObjectSerializer` | `ObjectValueSerializer` |
| `JsonValueDeserializer` | `ObjectValueDeserializer` |
| `@JsonComponent` | `@JacksonComponent` |
| `@JsonMixin` | `@JacksonMixin` |

**Migration Example:**
```kotlin
// Old (Spring Boot 3.x)
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer
import org.springframework.boot.jackson.JsonComponent

@JsonComponent
class CustomSerializer : JsonSerializer<MyType>() { }

@Configuration
class JacksonConfig {
    @Bean
    fun customizer(): Jackson2ObjectMapperBuilderCustomizer {
        return Jackson2ObjectMapperBuilderCustomizer { builder ->
            builder.simpleDateFormat("yyyy-MM-dd")
        }
    }
}

// New (Spring Boot 4.0)
import tools.jackson.databind.ObjectMapper
import org.springframework.boot.autoconfigure.jackson.JsonMapperBuilderCustomizer
import org.springframework.boot.jackson.JacksonComponent

@JacksonComponent
class CustomSerializer : JsonSerializer<MyType>() { }

@Configuration
class JacksonConfig {
    @Bean
    fun customizer(): JsonMapperBuilderCustomizer {
        return JsonMapperBuilderCustomizer { builder ->
            builder.simpleDateFormat("yyyy-MM-dd")
        }
    }
}
```

### Configuration Property Changes

**application.yml migration:**
```yaml
# Old (Spring Boot 3.x)
spring:
  jackson:
    read:
      enums-using-to-string: true
    write:
      dates-as-timestamps: false

# New (Spring Boot 4.0)
spring:
  jackson:
    json:
      read:
        enums-using-to-string: true
      write:
        dates-as-timestamps: false
```

### Jackson 2 Compatibility Module (Temporary)

For gradual migration, use the **temporary compatibility module** (deprecated, will be removed):

**libs.versions.toml:**
```toml
[libraries]
spring-boot-jackson2 = { module = "org.springframework.boot:spring-boot-jackson2", version.ref = "springBoot" }
```

**build.gradle.kts:**
```kotlin
dependencies {
    implementation(libs.spring.boot.jackson2)
}
```

**application.yml:**
```yaml
spring:
  jackson:
    use-jackson2-defaults: true # Use Jackson 2 behavior
```

**Properties under `spring.jackson2.*` namespace** when using compatibility module.

**Plan migration away from this module** - it will be removed in future versions.

## Core Framework Changes

### Nullability Annotations: JSpecify

Spring Boot 4.0 adds **JSpecify nullability annotations** throughout the codebase.

**Impact:**
- Kotlin null-safety may flag new warnings/errors
- Null checkers (SpotBugs, NullAway) may report new issues
- **RestClient methods like `body()` are now explicitly marked as nullable** - always check for null or use `Objects.requireNonNull()`

**Migration for Kotlin:**
```kotlin
// Explicit nullable types may be required
fun processUser(id: String?): User? {
    return userRepository.findById(id) // May now be explicitly nullable
}

// RestClient body() can return null
val body: String? = restClient.get()
    .uri("https://api.example.com/data")
    .retrieve()
    .body(String::class.java) // Nullable - handle appropriately

if (body != null) {
    println(body.length)
}
```

**Actuator endpoint parameters:**
- Cannot use `javax.annotations.NonNull` or `org.springframework.lang.Nullable`
- Use `org.jspecify.annotations.Nullable` instead

**libs.versions.toml:**
```toml
[libraries]
jspecify = { module = "org.jspecify:jspecify", version = "1.0.0" }
```

### Package Relocations

#### BootstrapRegistry

**Old import:**
```kotlin
import org.springframework.boot.BootstrapRegistry
```

**New import:**
```kotlin
import org.springframework.boot.bootstrap.BootstrapRegistry
```

#### EnvironmentPostProcessor

**Old import:**
```kotlin
import org.springframework.boot.env.EnvironmentPostProcessor
```

**New import:**
```kotlin
import org.springframework.boot.EnvironmentPostProcessor
```

**Update `META-INF/spring.factories`:**
```properties
# Old
org.springframework.boot.env.EnvironmentPostProcessor=com.example.MyPostProcessor

# New
org.springframework.boot.EnvironmentPostProcessor=com.example.MyPostProcessor
```

**Note:** Deprecated form still available temporarily but will be removed.

#### Entity Scan

**Old import:**
```kotlin
import org.springframework.boot.autoconfigure.domain.EntityScan
```

**New import:**
```kotlin
import org.springframework.boot.persistence.autoconfigure.EntityScan
```

### Logging Changes

#### Logback Default Charset

Log files now default to **UTF-8** (harmonized with Log4j2):

**logback-spring.xml (explicit configuration):**
```xml
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>app.log</file>
        <encoder>
            <charset>UTF-8</charset> <!-- Now default -->
            <pattern>%d{yyyy-MM-dd HH:mm:ss} - %msg%n</pattern>
        </encoder>
    </appender>
</configuration>
```

**Console logging:** Uses `Console#charset()` if available (Java 17+), otherwise falls back to UTF-8. This provides better platform compatibility while maintaining consistent encoding.

### DevTools Changes

#### Live Reload Disabled by Default

**application.yml:**
```yaml
spring:
  devtools:
    livereload:
      enabled: true # Must explicitly enable in 4.0
```

**libs.versions.toml:**
```toml
[libraries]
spring-boot-devtools = { module = "org.springframework.boot:spring-boot-devtools", version.ref = "springBoot" }
```

**build.gradle.kts:**
```kotlin
dependencies {
    developmentOnly(libs.spring.boot.devtools)
}
```

### PropertyMapper API Behavioral Change

**Breaking change:** No longer calls adapter/predicate methods by default when source is `null`.

**Migration pattern:**
```kotlin
// Old behavior (Spring Boot 3.x)
map.from(source::method).to(destination::method)
// Calls destination.method(null) if source returns null

// New behavior (Spring Boot 4.0)
map.from(source::method).to(destination::method)
// Skips call if source returns null

// Explicit null handling (new)
map.from(source::method).always().to(destination::method)
// Always calls destination.method(value), even if null
```

**Removed method:** `alwaysApplyingNotNull()` - use `always()` instead.

**Migration example:** Review [Spring Boot commit 239f384ac0](https://github.com/spring-projects/spring-boot/commit/239f384ac0893d151b89f204886874c6adb00001) to see how Spring Boot itself adapted to the new API.

## Dependency and Build Changes

### Gradle Plugin Updates

**build.gradle.kts:**
```kotlin
plugins {
```

---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/springboot-4-migration-full.md](../docs/rule-references/springboot-4-migration-full.md). Read that file on demand when deeper details are needed.
