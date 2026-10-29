---
trigger: model_decision
description: Step-by-step guide for converting Spring Boot JPA applications to use Azure Cosmos DB with Spring Data Cosmos. Applies to files matching **/*.java, **/pom.xml, **/build.gradle, **/application*.properties.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/convert-jpa-to-spring-data-cosmos.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Theo van Kraay
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.java`, `**/pom.xml`, `**/build.gradle`, `**/application*.properties`.

# Convert Spring JPA project to Spring Data Cosmos

> **Guard:** Apply this guide ONLY when the user explicitly asks to migrate to Azure Cosmos DB. Detecting JPA in a project does not authorize a migration. Otherwise, follow the `java-hibernate-jpa` and Spring Boot guidance.

This generalized guide applies to any JPA to Spring Data Cosmos DB conversion project.

## High-level plan

1. Swap build dependencies (remove JPA, add Cosmos + Identity).
2. Add `cosmos` profile and properties.
3. Add Cosmos config with proper Azure identity authentication.
4. Transform entities (ids → `String`, add `@Container` and `@PartitionKey`, remove JPA mappings, adjust relationships).
5. Convert repositories (`JpaRepository` → `CosmosRepository`).
6. **Create service layer** for relationship management and template compatibility.
7. **CRITICAL**: Update ALL test files to work with String IDs and Cosmos repositories.
8. Seed data via `CommandLineRunner`.
9. **CRITICAL**: Test runtime functionality and fix template compatibility issues.

## Step-by-step

### Step 1 — Build dependencies

- **Maven** (`pom.xml`):
  - Remove dependency `spring-boot-starter-data-jpa`
  - Remove database-specific dependencies (H2, MySQL, PostgreSQL) unless needed elsewhere
  - Add `com.azure:azure-spring-data-cosmos:5.17.0` (or latest compatible version)
  - Add `com.azure:azure-identity:1.15.4` (required for DefaultAzureCredential)
- **Gradle**: Apply same dependency changes for Gradle syntax
- Remove testcontainers and JPA-specific test dependencies

### Step 2 — Properties and Configuration

- Create `src/main/resources/application-cosmos.properties`:
  ```properties
  azure.cosmos.uri=${COSMOS_URI:https://localhost:8081}
  azure.cosmos.database=${COSMOS_DATABASE:petclinic}
  azure.cosmos.populate-query-metrics=false
  azure.cosmos.enable-multiple-write-locations=false
  ```
- Update `src/main/resources/application.properties`:
  ```properties
  spring.profiles.active=cosmos
  ```

### Step 3 — Configuration class with Azure Identity

- Create `src/main/java/<rootpkg>/config/CosmosConfiguration.java`:
  ```java
  @Configuration
  @EnableCosmosRepositories(basePackages = "<rootpkg>")
  public class CosmosConfiguration extends AbstractCosmosConfiguration {

    @Value("${azure.cosmos.uri}")
    private String uri;

    @Value("${azure.cosmos.database}")
    private String dbName;

    @Bean
    public CosmosClientBuilder getCosmosClientBuilder() {
      return new CosmosClientBuilder().endpoint(uri).credential(new DefaultAzureCredentialBuilder().build());
    }

    @Override
    protected String getDatabaseName() {
      return dbName;
    }

    @Bean
    public CosmosConfig cosmosConfig() {
      return CosmosConfig.builder().enableQueryMetrics(false).build();
    }
  }

  ```
- **IMPORTANT**: Use `DefaultAzureCredentialBuilder().build()` instead of key-based authentication for production security

### Step 4 — Entity transformation

- Target all classes with JPA annotations (`@Entity`, `@MappedSuperclass`, `@Embeddable`)
- **Base entity changes**:
  - Change `id` field type from `Integer` to `String`
  - Add `@Id` and `@GeneratedValue` annotations
  - Add `@PartitionKey` field (typically `String partitionKey`)
  - Remove all `jakarta.persistence` imports
- **CRITICAL - Cosmos DB Serialization Requirements**:
  - **Remove ALL `@JsonIgnore` annotations** from fields that need to be persisted to Cosmos DB
  - **Authentication entities (User, Authority) MUST be fully serializable** - no `@JsonIgnore` on password, authorities, or other persisted fields
  - **Use `@JsonProperty` instead of `@JsonIgnore`** when you need to control JSON field names but still persist the data
  - **Common authentication serialization errors**: `Cannot pass null or empty values to constructor` usually means `@JsonIgnore` is blocking required field serialization
- **Entity-specific changes**:
  - Replace `@Entity` with `@Container(containerName = "<plural-entity-name>")`
  - Remove `@Table`, `@Column`, `@JoinColumn`, etc.
  - Remove relationship annotations (`@OneToMany`, `@ManyToOne`, `@ManyToMany`)
  - For relationships:
    - Embed collections for one-to-many (e.g., `List<Pet> pets` in Owner)
    - Use reference IDs for many-to-one (e.g., `String ownerId` in Pet)
    - **For complex relationships**: Store IDs but add transient properties for templates
  - Add constructor to set partition key: `setPartitionKey("entityType")`
- **CRITICAL - Authentication Entity Pattern**:
  - **For User entities with Spring Security**: Store authorities as `Set<String>` instead of `Set<Authority>` objects
  - **Example User entity transformation**:
    ```java
    @Container(containerName = "users")
    public class User {

      @Id
      private String id;

      @PartitionKey
      private String partitionKey = "user";

      private String login;
      private String password; // NO @JsonIgnore - must be serializable

      @JsonProperty("authorities") // Use @JsonProperty, not @JsonIgnore
      private Set<String> authorities = new HashSet<>(); // Store as strings

      // Add transient property for Spring Security compatibility if needed
      // @JsonIgnore - ONLY for transient properties not persisted to Cosmos
      private Set<Authority> authorityObjects = new HashSet<>();

      // Conversion methods between string authorities and Authority objects
      public void setAuthorityObjects(Set<Authority> authorities) {
        this.authorityObjects = authorities;
        this.authorities = authorities.stream().map(Authority::getName).collect(Collectors.toSet());
      }
    }

    ```
- **CRITICAL - Template Compatibility for Relationship Changes**:
  - **When converting relationships to ID references, preserve template access**
  - **Example**: If entity had `List<Specialty> specialties` → convert to:
    - Storage: `List<String> specialtyIds` (persisted to Cosmos)
    - Template: `@JsonIgnore private List<Specialty> specialties = new ArrayList<>()` (transient)
    - Add getters/setters for both properties
  - **Update entity method logic**: `getNrOfSpecialties()` should use the transient list
- **CRITICAL - Template Compatibility for Thymeleaf/JSP Applications**:
  - **Identify template property access**: Search for `${entity.relationshipProperty}` in `.html` files
  - **For each relationship property accessed in templates**:
    - **Storage**: Keep ID-based storage (e.g., `List<String> specialtyIds`)
    - **Template Access**: Add transient property with `@JsonIgnore` (e.g., `private List<Specialty> specialties = new ArrayList<>()`)
    - **Example**:

      ```java
      // Stored in Cosmos (persisted)
      private List<String> specialtyIds = new ArrayList<>();

      // For template access (transient)
      @JsonIgnore
      private List<Specialty> specialties = new ArrayList<>();

      // Getters/setters for both properties
      public List<String> getSpecialtyIds() {
        return specialtyIds;
      }

      public List<Specialty> getSpecialties() {
        return specialties;
      }

      ```

    - **Update count methods**: `getNrOfSpecialties()` should use transient list, not ID list
- **CRITICAL - Method Signature Conflicts**:
  - **When converting ID types from Integer to String, check for method signature conflicts**
  - **Common conflict**: `getPet(String name)` vs `getPet(String id)` - both have same signature
  - **Solution**: Rename methods to be specific:
    - `getPet(String id)` for ID-based lookup
    - `getPetByName(String name)` for name-based lookup
    - `getPetByName(String name, boolean ignoreNew)` for conditional name-based lookup
  - **Update ALL callers** of renamed methods in controllers and tests
- **Method updates for entities**:
  - Update `addVisit(Integer petId, Visit visit)` to `addVisit(String petId, Visit visit)`
  - Ensure all ID comparison logic uses `.equals()` instead of `==`

### Step 5 — Repository conversion

- Change all repository interfaces:
  - From: `extends JpaRepository<Entity, Integer>`
  - To: `extends CosmosRepository<Entity, String>`
- **Query method updates**:
  - Remove pagination parameters from custom queries
  - Change `Page<Entity> findByX(String param, Pageable pageable)` to `List<Entity> findByX(String param)`
  - Update `@Query` annotations to use Cosmos SQL syntax
  - **Replace custom method names**: `findPetTypes()` → `findAllOrderByName()`
  - **Update ALL references** to changed method names in controllers and formatters

### Step 6 — **Create service layer** for relationship management and template compatibility

- **CRITICAL**: Create service classes to bridge Cosmos document storage with existing template expectations
- **Purpose**: Handle relationship population and maintain template compatibility
- **Service pattern for each entity with relationships**:
  ```java
  @Service
  public class EntityService {

    private final EntityRepository entityRepository;
    private final RelatedRepository relatedRepository;

    public EntityService(EntityRepository entityRepository, RelatedRepository relatedRepository) {
      this.entityRepository = entityRepository;
      this.relatedRepository = relatedRepository;
    }

    public List<Entity> findAll() {
      List<Entity> entities = entityRepository.findAll();
      entities.forEach(this::populateRelationships);
      return entities;
    }

    public Optional<Entity> findById(String id) {
      Optional<Entity> entityOpt = entityRepository.findById(id);
      if (entityOpt.isPresent()) {
        Entity entity = entityOpt.get();
        populateRelationships(entity);
        return Optional.of(entity);
      }
      return Optional.empty();
    }

    private void populateRelationships(Entity entity) {
      if (entity.getRelatedIds() != null && !entity.getRelatedIds().isEmpty()) {
        List<Related> related = entity
          .getRelatedIds()
          .stream()
          .map(relatedRepository::findById)
          .filter(Optional::isPresent)
          .map(Optional::get)
          .collect(Collectors.toList());
        // Set transient property for template access
        entity.setRelated(related);
      }
    }
  }

  ```

### Step 6.5 — **Spring Security Integration** (CRITICAL for Authentication)

- **UserDetailsService Integration Pattern**:
  ```java
  @Service
  @Transactional
  public class DomainUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;

    @Override
    public UserDetails loadUserByUsername(String login) {
      log.debug("Authenticating user: {}", login);

      return userRepository
        .findOneByLogin(login)
        .map(user -> createSpringSecurityUser(login, user))
        .orElseThrow(() -> new UsernameNotFoundException("User " + login + " was not found"));
    }

    private org.springframework.security.core.userdetails.User createSpringSecurityUser(String lowercaseLogin, User user) {
      if (!user.isActivated()) {
        throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
      }

      // Convert string authorities back to GrantedAuthority objects
      List<GrantedAuthority> grantedAuthorities = user
        .getAuthorities()
        .stream()
        .map(SimpleGrantedAuthority::new)
        .collect(Collectors.toList());

      return new org.springframework.security.core.userdetails.User(user.getLogin(), user.getPassword(), grantedAuthorities);
    }
  }

  ```
- **Key Authentication Requirements**:
  - User entity must be fully serializable (no `@JsonIgnore` on password/authorities)
  - Store authorities as `Set<String>` for Cosmos DB compatibility
  - Convert between string authorities and `GrantedAuthority` objects in UserDetailsService
  - Add comprehensive debugging logs to trace authentication flow
  - Handle activated/deactivated user states appropriately

#### **Template Relationship Population Pattern**

Each service method that returns entities for template rendering MUST populate transient properties:

```java
private void populateRelationships(Entity entity) {
  // For each relationship used in templates
  if (entity.getRelatedIds() != null && !entity.getRelatedIds().isEmpty()) {
    List<Related> relatedObjects = entity
      .getRelatedIds()
      .stream()
      .map(relatedRepository::findById)
      .filter(Optional::isPresent)
      .map(Optional::get)
      .collect(Collectors.toList());
    entity.setRelated(relatedObjects); // Set transient property
  }
}

```

#### **Critical Service Usage in Controllers**

- **Replace ALL direct repository calls** with service calls in controllers
- **Never return entities from repositories directly** to templates without relationship population
- **Update controllers** to use service layer instead of repositories directly
- **Controller pattern change**:

  ```java
  // OLD: Direct repository usage
  @Autowired
  private EntityRepository entityRepository;

  // NEW: Service layer usage
  @Autowired
  private EntityService entityService;
  // Update method calls
  // OLD: entityRepository.findAll()
  // NEW: entityService.findAll()

  ```

### Step 7 — Data seeding

- Create `@Component` implementing `CommandLineRunner`:
  ```java
  @Component
  public class DataSeeder implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
      if (ownerRepository.count() > 0) {
        return; // Data already exists
      }
      // Seed comprehensive test data with String IDs
      // Use meaningful ID patterns: "owner-1", "pet-1", "pettype-1", etc.
    }
  }

  ```
- **CRITICAL - BigDecimal Reflection Issues with JDK 17+**:
  - **If using BigDecimal fields**, you may encounter reflection errors during seeding
  - **Error pattern**: `Unable to make field private final java.math.BigInteger java.math.BigDecimal.intVal accessible`
  - **Solutions**:
    1. Use `Double` or `String` instead of `BigDecimal` for monetary values
    2. Add JVM argument: `--add-opens java.base/java.math=ALL-UNNAMED`
    3. Wrap BigDecimal operations in try-catch and handle gracefully
  - **The application will start successfully even if seeding fails** - check logs for seeding errors

### Step 8 — Test file conversion (CRITICAL SECTION)

**This step is often overlooked but essential for successful conversion**

#### A. **COMPILATION CHECK STRATEGY**

- **After each major change, run `mvn test-compile` to catch issues early**
- **Fix compilation errors systematically before proceeding**
- **Don't rely on IDE - Maven compilation reveals all issues**

#### B. **Search and Update ALL test files systematically**

**Use search tools to find and update every occurrence:**

- Search for: `int.*TEST.*ID` → Replace with: `String.*TEST.*ID = "test-xyz-1"`
- Search for: `setId\(\d+\)` → Replace with: `setId("test-id-X")`
- Search for: `findById\(\d+\)` → Replace with: `findById("test-id-X")`
- Search for: `\.findPetTypes\(\)` → Replace with: `.findAllOrderByName()`
- Search for: `\.findByLastNameStartingWith\(.*,.*Pageable` → Remove pagination parameter

#### C. Update test annotations and imports

- Replace `@DataJpaTest` with `@SpringBootTest` or appropriate slice test
- Remove `@AutoConfigureTestDatabase` annotations
- Remove `@Transactional` from tests (unless single-partition operations)
- Remove imports from `org.springframework.orm` package

#### D. Fix entity ID usage in ALL test files

**Critical files that MUST be updated (search entire test directory):**

- `*ControllerTests.java` - Path variables, entity creation, mock setup
- `*ServiceTests.java` - Repository interactions, entity IDs
- `EntityUtils.java` - Utility methods for ID handling
- `*FormatterTests.java` - Repository method calls
- `*ValidatorTests.java` - Entity creation with String IDs
- Integration test classes - Test data setup

#### E. **Fix Controller and Service classes affected by repository changes**

- **Update controllers that call repository methods with changed signatures**
- **Update formatters/converters that use repository methods**
- **Common files to check**:
  - `PetTypeFormatter.java` - often calls `findPetTypes()` method
  - `*Controller.java` - may have pagination logic to remove
  - Service classes that use repository methods

#### F. Update repository mocking in tests

- Remove pagination from repository mocks:
  - `given(repository.findByX(param, pageable)).willReturn(pageResult)`
  - → `given(repository.findByX(param)).willReturn(listResult)`
- Update method names in mocks:
  - `given(petTypeRepository.findPetTypes()).willReturn(types)`
  - → `given(petTypeRepository.findAllOrderByName()).willReturn(types)`

#### G. Fix utility classes used by tests

- Update `EntityUtils.java` or similar:
  - Remove JPA-specific exception imports (`ObjectRetrievalFailureException`)
  - Change method signatures from `int id` to `String id`
  - Update ID comparison logic: `entity.getId() == entityId` → `entity.getId().equals(entityId)`
  - Replace JPA exceptions with standard exceptions (`IllegalArgumentException`)

#### H. Update assertions for String IDs

- Change ID assertions:
  - `assertThat(entity.getId()).isNotZero()` → `assertThat(entity.getId()).isNotEmpty()`
  - `assertThat(entity.getId()).isEqualTo(1)` → `assertThat(entity.getId()).isEqualTo("test-id-1")`
  - JSON path assertions: `jsonPath("$.id").value(1)` → `jsonPath("$.id").value("test-id-1")`

### Step 8 — Test file conversion (CRITICAL SECTION)

**This step is often overlooked but essential for successful conversion**

#### A. **COMPILATION CHECK STRATEGY**

- **After each major change, run `mvn test-compile` to catch issues early**
- **Fix compilation errors systematically before proceeding**
- **Don't rely on IDE - Maven compilation reveals all issues**

#### B. **Search and Update ALL test files systematically**

**Use search tools to find and update every occurrence:**

- Search for: `setId\(\d+\)` → Replace with: `setId("test-id-X")`
- Search for: `findById\(\d+\)` → Replace with: `findById("test-id-X")`
- Search for: `\.findPetTypes\(\)` → Replace with: `.findAllOrderByName()`
- Search for: `\.findByLastNameStartingWith\(.*,.*Pageable` → Remove pagination parameter

#### C. Update test annotations and imports


---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/convert-jpa-to-spring-data-cosmos-full.md](../docs/rule-references/convert-jpa-to-spring-data-cosmos-full.md). Read that file on demand when deeper details are needed.
