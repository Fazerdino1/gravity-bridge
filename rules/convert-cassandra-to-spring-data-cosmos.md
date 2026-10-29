---
trigger: model_decision
description: Step-by-step guide for converting Spring Boot Cassandra applications to use Azure Cosmos DB with Spring Data Cosmos. Applies to files matching **/*.java, **/pom.xml, **/build.gradle, **/application*.properties, **/application*.yml, **/application*.conf.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/convert-cassandra-to-spring-data-cosmos.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Theo van Kraay
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.java`, `**/pom.xml`, `**/build.gradle`, `**/application*.properties`, `**/application*.yml`, `**/application*.conf`.

# Comprehensive Guide: Converting Spring Boot Cassandra Applications to use Azure Cosmos DB with Spring Data Cosmos (spring-data-cosmos)

> **Guard:** Apply this guide ONLY when the user explicitly asks to migrate to Azure Cosmos DB. Detecting Cassandra in a project does not authorize a migration. Otherwise, follow the Spring Boot guidance.

## Applicability

This guide applies to:
- ✅ Spring Boot 2.x - 3.x applications (both reactive and non-reactive)
- ✅ Maven and Gradle-based projects
- ✅ Applications using Spring Data Cassandra, Cassandra DAOs, or DataStax drivers
- ✅ Projects with or without Lombok
- ✅ UUID-based or String-based entity identifiers
- ✅ Both synchronous and reactive (Spring WebFlux) applications

This guide does NOT cover:
- ❌ Non-Spring frameworks (Jakarta EE, Micronaut, Quarkus, plain Java)
- ❌ Complex Cassandra features (materialized views, UDTs, counters, custom types)
- ❌ Bulk data migration (code conversion only - data must be migrated separately)
- ❌ Cassandra-specific features like lightweight transactions (LWT) or batch operations across partitions

## Overview

This guide provides step-by-step instructions for converting reactive Spring Boot applications from Apache Cassandra to Azure Cosmos DB using Spring Data Cosmos. It covers all major issues encountered and their solutions, based on real-world conversion experience.

## Prerequisites

- Java 11 or higher (Java 17+ required for Spring Boot 3.x)
- Azure CLI installed and authenticated (`az login`) for local development
- Azure Cosmos DB account created in Azure Portal
- Maven 3.6+ or Gradle 6+ (depending on your project)
- For Gradle projects with Spring Boot 3.x: Ensure JAVA_HOME environment variable points to Java 17+
- Basic understanding of your application's data model and query patterns

## Database Setup for Azure Cosmos DB

**CRITICAL**: Before running your application, ensure the database exists in your Cosmos DB account.

### Option 1: Manual Database Creation (Recommended for first run)
1. Go to Azure Portal → Your Cosmos DB account
2. Navigate to "Data Explorer"
3. Click "New Database"
4. Enter the database name matching your application configuration (check `application.properties` or `application.yml` for the configured database name)
5. Choose throughput settings (Manual or Autoscale based on your needs)
   - Start with Manual 400 RU/s for development/testing
   - Use Autoscale for production workloads with variable traffic
6. Click OK

### Option 2: Automatic Creation
Spring Data Cosmos can auto-create the database on first connection, but this requires:
- Proper RBAC permissions (Cosmos DB Built-in Data Contributor role)
- May fail if permissions are insufficient

### Container (Collection) Creation
Containers will be auto-created by Spring Data Cosmos when the application starts, using the `@Container` annotation settings from your entities. No manual container creation is needed unless you want to configure specific throughput or indexing policies.

## Authentication with Azure Cosmos DB

### Using DefaultAzureCredential (Recommended)
The `DefaultAzureCredential` authentication method is the recommended approach for both development and production:

**How it works**:
1. Tries multiple credential sources in order:
   - Environment variables
   - Workload Identity (for AKS)
   - Managed Identity (for Azure VMs/App Service)
   - Azure CLI (`az login`)
   - Azure PowerShell
   - Azure Developer CLI

**Setup for local development**:
```bash
# Login via Azure CLI
az login

# The application will automatically use your CLI credentials
```

**Configuration** (no key required):
```java
@Bean
public CosmosClientBuilder getCosmosClientBuilder() {
    return new CosmosClientBuilder()
        .endpoint(uri)
        .credential(new DefaultAzureCredentialBuilder().build());
}
```

**Properties file** (application-cosmos.properties or application.properties):
```properties
azure.cosmos.uri=https://<your-cosmos-account-name>.documents.azure.com:443/
azure.cosmos.database=<your-database-name>
# No key property needed when using DefaultAzureCredential
azure.cosmos.populate-query-metrics=false
```

**Note**: Replace `<your-cosmos-account-name>` and `<your-database-name>` with your actual values.

### RBAC Permissions Required
When using DefaultAzureCredential, your Azure identity needs appropriate RBAC permissions:

**Common startup error**:
```
Request blocked by Auth: Request for Read DatabaseAccount is blocked because principal
[xxx] does not have required RBAC permissions to perform action
[Microsoft.DocumentDB/databaseAccounts/sqlDatabases/write] on any scope.
```

**Solution**: Assign the "Cosmos DB Built-in Data Contributor" role:
```bash
# Get your user's object ID
PRINCIPAL_ID=$(az ad signed-in-user show --query id -o tsv)

# Assign the role (replace <resource-group> with your actual resource group)
az cosmosdb sql role assignment create \
  --account-name your-cosmos-account \
  --resource-group <resource-group> \
  --scope "/" \
  --principal-id $PRINCIPAL_ID \
  --role-definition-name "Cosmos DB Built-in Data Contributor"
```

**Alternative**: If you're logged in with `az login`, your account should already have permissions if you're the owner/contributor of the Cosmos DB account.

### Key-Based Authentication (Local Emulator Only)
Only use key-based authentication for local emulator development:

```java
@Bean
public CosmosClientBuilder getCosmosClientBuilder() {
    // Only for local emulator
    if (key != null && !key.isEmpty()) {
        return new CosmosClientBuilder()
            .endpoint(uri)
            .key(key);
    }
    // Production: use DefaultAzureCredential
    return new CosmosClientBuilder()
        .endpoint(uri)
        .credential(new DefaultAzureCredentialBuilder().build());
}
```

## Critical Lessons Learned

### Java Version Requirements (Spring Boot 3.x)
**Problem**: Spring Boot 3.0+ requires Java 17 or higher. Using Java 11 causes build failures.
**Error**:
```
No matching variant of org.springframework.boot:spring-boot-gradle-plugin:3.0.5 was found.
Incompatible because this component declares a component compatible with Java 17
and the consumer needed a component compatible with Java 11
```

**Solution**:
```bash
# Check Java version
java -version

# Set JAVA_HOME to Java 17+
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Linux
# or
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home  # macOS

# Verify
echo $JAVA_HOME
```

**For Gradle projects**, always run with correct JAVA_HOME:
```bash
export JAVA_HOME=/path/to/java-17
./gradlew clean build
./gradlew bootRun
```

### Gradle-Specific Issues

#### Issue 1: Old Configuration File Conflicts
**Problem**: When renaming or replacing Cassandra configuration files, the old file may still exist, causing compilation errors:
```
error: class CosmosConfiguration is public, should be declared in a file named CosmosConfiguration.java
```

**Solution**: Explicitly delete the old Cassandra configuration file(s):
```bash
# Find and remove old Cassandra config files
find src/main/java -name "*CassandraConfig*.java" -o -name "*CassandraConfiguration*.java"
# Review the output, then delete if appropriate
rm src/main/java/<path-to-old-config>/CassandraConfig.java
```

#### Issue 2: Repository findAllById Returns Iterable
**Problem**: CosmosRepository's `findAllById()` returns `Iterable<Entity>`, not `List<Entity>`. Calling `.stream()` directly fails:
```
error: cannot find symbol
  symbol:   method stream()
  location: interface Iterable<YourEntity>
```

**Solution**: Handle Iterable properly:
```java
// WRONG - Iterable doesn't have stream() method
var entities = repository.findAllById(ids).stream()...

// CORRECT - Option 1: Use forEach to populate a collection
Iterable<YourEntity> entitiesIterable = repository.findAllById(ids);
Map<String, YourEntity> entityMap = new HashMap<>();
entitiesIterable.forEach(entity -> entityMap.put(entity.getId(), entity));

// CORRECT - Option 2: Convert to List first
List<YourEntity> entities = new ArrayList<>();
repository.findAllById(ids).forEach(entities::add);

// CORRECT - Option 3: Use StreamSupport (Java 8+)
List<YourEntity> entities = StreamSupport.stream(
    repository.findAllById(ids).spliterator(), false)
    .collect(Collectors.toList());
```

### package-info.java javax.annotation Issues
**Problem**: `package-info.java` using `javax.annotation.ParametersAreNonnullByDefault` causes compilation errors in Java 11+:
```
error: cannot find symbol
import javax.annotation.ParametersAreNonnullByDefault;
```

**Solution**: Remove or simplify the package-info.java file:
```java
// Simple version - just package declaration
package com.your.package;
```

### Entity Constructor Issues
**Problem**: Using Lombok `@NoArgsConstructor` with manual constructors causes duplicate constructor compilation errors.
**Solution**: Choose one approach:
- Option 1: Remove `@NoArgsConstructor` and keep manual constructors
- Option 2: Remove manual constructors and rely on Lombok annotations
- **Best Practice**: For Cosmos entities with initialization logic (like setting partition keys), remove `@NoArgsConstructor` and use manual constructors only.

### Business Object Constructor Removal
**Problem**: Removing `@AllArgsConstructor` or custom constructors from entity classes breaks existing code that uses those constructors.
**Impact**: Mapping utilities, data seeders, and test files will fail to compile.
**Solution**:
- After removing or modifying constructors, search ALL files for constructor calls to those entities
- Replace with default constructor + setter pattern:
  ```java
  // Before - using all-args constructor
  MyEntity entity = new MyEntity(id, field1, field2, field3);

  // After - using default constructor + setters
  MyEntity entity = new MyEntity();
  entity.setId(id);
  entity.setField1(field1);
  entity.setField2(field2);
  entity.setField3(field3);
  ```
### Data Seeder Constructor Calls
**Problem**: Data seeding or initialization code uses entity constructors that may not exist after entity conversion to Cosmos annotations.
**Solution**: Update all entity instantiations in data seeding components to use setters:
```java
// Before - constructor-based initialization
MyEntity entity1 = new MyEntity("entity-1", "value1", "value2");

// After - setter-based initialization
MyEntity entity1 = new MyEntity();
entity1.setId("entity-1");
entity1.setField1("value1");
entity1.setField2("value2");
```

**Common files to check**: DataSeeder, DatabaseInitializer, TestDataLoader, or any `@Component` implementing `CommandLineRunner`
```java
OwnerEntity owner1 = new OwnerEntity();
owner1.setId("owner-1");
```

### Test File Updates Required
**Problem**: Test files reference old Cassandra DAOs and use UUID constructors.
**Critical Files to Update**:
1. Remove `MockReactiveResultSet.java` (Cassandra-specific)
2. Update `*ReactiveServicesTest.java` - replace DAO references with Cosmos repositories
3. Update `*ReactiveControllerTest.java` - replace DAO references with Cosmos repositories
4. Replace all `UUID.fromString()` with String IDs
5. Replace constructor calls: `new Owner(UUID.fromString(...))` with setter pattern

### Application Startup and DefaultAzureCredential Behavior
**Important**: DefaultAzureCredential tries multiple authentication methods in sequence, which is normal and expected.

**Expected startup log pattern**:
```
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential EnvironmentCredential is unavailable.
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential WorkloadIdentityCredential is unavailable.
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential ManagedIdentityCredential is unavailable.
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential SharedTokenCacheCredential is unavailable.
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential IntelliJCredential is unavailable.
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential AzureCliCredential is unavailable.
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential AzurePowerShellCredential is unavailable.
INFO c.azure.identity.ChainedTokenCredential : Azure Identity => Attempted credential AzureDeveloperCliCredential returns a token
```

**Key points**:
- The "unavailable" messages are **NORMAL** - it's trying each credential source in order
- Once it finds one that works (e.g., AzureCliCredential or AzureDeveloperCliCredential), it will use that
- **Do not interrupt the startup process** - it takes 10-15 seconds to cycle through credential sources
- Application typically takes 30-60 seconds total to fully start and connect to Cosmos DB

**Success indicators**:
```
INFO c.a.c.i.RxDocumentClientImpl : Initializing DocumentClient [1] with serviceEndpoint [https://your-account.documents.azure.com:443/]
INFO c.a.c.i.GlobalEndpointManager : db account retrieved {...}
INFO c.a.c.implementation.SessionContainer : Registering a new collection resourceId [...]
INFO o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat started on port(s): 8944 (http)
INFO com.your.app.Application : Started Application in X.XXX seconds
```

**Troubleshooting startup failures**:

1. **If all credentials are "unavailable"**:
   ```bash
   # Re-authenticate with Azure CLI
   az login

   # Verify login
   az account show
   ```

2. **If you see permission errors**:
   ```
   Request blocked by Auth: principal [xxx] does not have required RBAC permissions
   ```
   - Ensure database exists in Cosmos DB account (see Database Setup section)
   - Verify RBAC permissions (see Authentication section)
   - Check that you're logged into the correct Azure subscription

3. **Port already in use**:
   ```bash
   # Find and kill the process
   lsof -ti:8944 | xargs kill -9

   # Or change the port in application.properties
   server.port=8945
   ```

### Application Startup Patience
**Problem**: Application takes 30-60 seconds to fully start (compilation + Spring Boot + Cosmos DB connection).
**Solution**:
- For Gradle: `./gradlew bootRun` (runs in foreground by default)
- For Maven: `mvn spring-boot:run`
- Use background execution if needed: `nohup ./gradlew bootRun > app.log 2>&1 &`
- **CRITICAL**: Do not interrupt the startup process, especially during credential authentication (10-15 seconds)
- Monitor logs: `tail -f app.log` or check for "Started Application" message
- Wait for Tomcat to start and show the port number before testing endpoints

### Port Configuration
**Problem**: Application may not run on default port 8080.
**Solution**:
- Check actual port: `ss -tlnp | grep java`
- Test connectivity: `curl http://localhost:<port>/petclinic/api/owners`
- Common ports: 8080, 9966, 9967

## Systematic Compilation Error Resolution

During this conversion, we encountered over 100 compilation errors. Here's the systematic approach that resolved them:

### Step 1: Identify Residual Cassandra Files
**Problem**: Old Cassandra-specific files cause compilation errors after dependencies are removed.
**Solution**: Delete all Cassandra-specific files systematically:

```bash
# Identify and delete old DAOs
find . -name "*Dao.java" -o -name "*DAO.java"
# Delete: OwnerReactiveDao, PetReactiveDao, VetReactiveDao, VisitReactiveDao

# Identify and delete Cassandra mappers
find . -name "*Mapper.java" -o -name "*EntityToOwnerMapper.java"
# Delete: EntityToOwnerMapper, EntityToPetMapper, EntityToVetMapper, EntityToVisitMapper

# Identify and delete old configuration
find . -name "*CassandraConfig.java" -o -name "CassandraConfiguration.java"
# Delete: CassandraConfiguration.java

# Identify test utilities for Cassandra
find . -name "MockReactiveResultSet.java"
# Delete: MockReactiveResultSet.java (Cassandra-specific test utility)
```

### Step 2: Run Incremental Compilation Checks
**Approach**: After each major change, compile to identify remaining issues:

```bash
# After deleting old files
mvn compile 2>&1 | grep -E "(ERROR|error)" | wc -l
# Expected: Number decreases with each fix

# After updating entity constructors
mvn compile 2>&1 | grep "constructor"
# Identify constructor-related compilation errors

# After fixing business object constructors
mvn compile 2>&1 | grep -E "(new Owner|new Pet|new Vet|new Visit)"
# Identify remaining constructor calls that need fixing
```

### Step 3: Fix Constructor-Related Errors Systematically
**Pattern**: Search for all constructor calls in specific file types:

```bash
# Find all constructor calls in MappingUtils
grep -n "new Owner\|new Pet\|new Vet\|new Visit" src/main/java/**/MappingUtils.java

# Find all constructor calls in DataSeeder
grep -n "new OwnerEntity\|new PetEntity\|new VetEntity\|new VisitEntity" src/main/java/**/DataSeeder.java

# Find all constructor calls in test files
grep -rn "new Owner\|new Pet\|new Vet\|new Visit" src/test/java/
```

### Step 4: Update Tests Last
**Rationale**: Fix application code before test code to see all issues clearly:

1. First: Update test repository mocks (DAO → Cosmos Repository)
2. Second: Fix UUID → String conversions in test data
3. Third: Update constructor calls in test setup
4. Finally: Run tests to verify: `mvn test`

### Step 5: Verify Zero Compilation Errors
**Final Check**:
```bash
# Clean and full compile
mvn clean compile

# Should see: BUILD SUCCESS
# Should NOT see any ERROR messages

# Verify test compilation
mvn test-compile

# Run tests
mvn test
```

**Success Indicators**:
- `mvn compile`: BUILD SUCCESS
- `mvn test`: All tests pass (even if some are skipped)
- No ERROR messages in output
- No "cannot find symbol" errors
- No "constructor cannot be applied" errors

## Conversion Steps

### 1. Update Maven Dependencies

#### Remove Cassandra Dependencies
```xml
<!-- REMOVE these Cassandra dependencies -->
<dependency>
    <groupId>com.datastax.oss</groupId>
    <artifactId>java-driver-core</artifactId>
</dependency>
<dependency>
    <groupId>com.datastax.oss</groupId>
    <artifactId>java-driver-query-builder</artifactId>
</dependency>
```

#### Add Azure Cosmos Dependencies
```xml
```

---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/convert-cassandra-to-spring-data-cosmos-full.md](../docs/rule-references/convert-cassandra-to-spring-data-cosmos-full.md). Read that file on demand when deeper details are needed.
