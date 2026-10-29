---
trigger: model_decision
description: Guidelines and best practices for Apex development on the Salesforce Platform. Applies to files matching **/*.cls, **/*.trigger.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/apex.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: BBoyBen
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.cls`, `**/*.trigger`.

# Apex Development

## General Instructions

- Always use the latest Apex features and best practices for the Salesforce Platform.
- Write clear and concise comments for each class and method, explaining the business logic and any complex operations.
- Handle edge cases and implement proper exception handling with meaningful error messages.
- Focus on bulkification - write code that handles collections of records, not single records.
- Be mindful of governor limits and design solutions that scale efficiently.
- Implement proper separation of concerns using service layers, domain classes, and selector classes.
- Document external dependencies, integration points, and their purposes in comments.

## Naming Conventions

- **Classes**: Use `PascalCase` for class names. Name classes descriptively to reflect their purpose.
  - Controllers: suffix with `Controller` (e.g., `AccountController`)
  - Trigger Handlers: suffix with `TriggerHandler` (e.g., `AccountTriggerHandler`)
  - Service Classes: suffix with `Service` (e.g., `AccountService`)
  - Selector Classes: suffix with `Selector` (e.g., `AccountSelector`)
  - Test Classes: suffix with `Test` (e.g., `AccountServiceTest`)
  - Batch Classes: suffix with `Batch` (e.g., `AccountCleanupBatch`)
  - Queueable Classes: suffix with `Queueable` (e.g., `EmailNotificationQueueable`)

- **Methods**: Use `camelCase` for method names. Use verbs to indicate actions.
  - Good: `getActiveAccounts()`, `updateContactEmail()`, `deleteExpiredRecords()`
  - Avoid abbreviations: `getAccs()` → `getAccounts()`

- **Variables**: Use `camelCase` for variable names. Use descriptive names.
  - Good: `accountList`, `emailAddress`, `totalAmount`
  - Avoid single letters except for loop counters: `a` → `account`

- **Constants**: Use `UPPER_SNAKE_CASE` for constants.
  - Good: `MAX_BATCH_SIZE`, `DEFAULT_EMAIL_TEMPLATE`, `ERROR_MESSAGE_PREFIX`

- **Triggers**: Name triggers as `ObjectName` + trigger event (e.g., `AccountTrigger`, `ContactTrigger`)

## Best Practices

### Bulkification

- **Always write bulkified code** - Design all code to handle collections of records, not individual records.
- Avoid SOQL queries and DML statements inside loops.
- Use collections (`List<>`, `Set<>`, `Map<>`) to process multiple records efficiently.

```apex
// Good Example - Bulkified
public static void updateAccountRating(List<Account> accounts) {
    for (Account acc : accounts) {
        if (acc.AnnualRevenue > 1000000) {
            acc.Rating = 'Hot';
        }
    }
    update accounts;
}

// Bad Example - Not bulkified
public static void updateAccountRating(Account account) {
    if (account.AnnualRevenue > 1000000) {
        account.Rating = 'Hot';
        update account; // DML in a method designed for single records
    }
}
```

### Maps for O(1) Lookup

- **Use Maps for efficient lookups** - Convert lists to maps for O(1) constant-time lookups instead of O(n) list iterations.
- Use `Map<Id, SObject>` constructor to quickly convert query results to a map.
- Ideal for matching related records, lookups, and avoiding nested loops.

```apex
// Good Example - Using Map for O(1) lookup
Map<Id, Account> accountMap = new Map<Id, Account>([
    SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds
]);

for (Contact con : contacts) {
    Account acc = accountMap.get(con.AccountId);
    if (acc != null) {
        con.Industry__c = acc.Industry;
    }
}

// Bad Example - Nested loop with O(n²) complexity
List<Account> accounts = [SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds];

for (Contact con : contacts) {
    for (Account acc : accounts) {
        if (con.AccountId == acc.Id) {
            con.Industry__c = acc.Industry;
            break;
        }
    }
}

// Good Example - Map for grouping records
Map<Id, List<Contact>> contactsByAccountId = new Map<Id, List<Contact>>();
for (Contact con : contacts) {
    if (!contactsByAccountId.containsKey(con.AccountId)) {
        contactsByAccountId.put(con.AccountId, new List<Contact>());
    }
    contactsByAccountId.get(con.AccountId).add(con);
}
```

### Governor Limits

- Be aware of Salesforce governor limits: SOQL queries (100), DML statements (150), heap size (6MB), CPU time (10s).
- **Monitor governor limits proactively** using `System.Limits` class to check consumption before hitting limits.
- Use efficient SOQL queries with selective filters and appropriate indexes.
- Implement **SOQL for loops** for processing large data sets.
- Use **Batch Apex** for operations on large data volumes (>50,000 records).
- Leverage **Platform Cache** to reduce redundant SOQL queries.

```apex
// Good Example - SOQL for loop for large data sets
public static void processLargeDataSet() {
    for (List<Account> accounts : [SELECT Id, Name FROM Account]) {
        // Process batch of 200 records
        processAccounts(accounts);
    }
}

// Good Example - Using WHERE clause to reduce query results
List<Account> accounts = [SELECT Id, Name FROM Account WHERE IsActive__c = true LIMIT 200];
```

### Security and Data Access

- **Always check CRUD/FLS permissions** before performing SOQL queries or DML operations.
- Use `WITH SECURITY_ENFORCED` in SOQL queries to enforce field-level security.
- Use `Security.stripInaccessible()` to remove fields the user cannot access.
- Implement `WITH SHARING` keyword for classes that enforce sharing rules.
- Use `WITHOUT SHARING` only when necessary and document the reason.
- Use `INHERITED SHARING` for utility classes to inherit the calling context.

```apex
// Good Example - Checking CRUD and using stripInaccessible
public with sharing class AccountService {
    public static List<Account> getAccounts() {
        if (!Schema.sObjectType.Account.isAccessible()) {
            throw new SecurityException('User does not have access to Account object');
        }

        List<Account> accounts = [SELECT Id, Name, Industry FROM Account WITH SECURITY_ENFORCED];

        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.READABLE, accounts
        );

        return decision.getRecords();
    }
}

// Good Example - WITH SHARING for sharing rules
public with sharing class AccountController {
    // This class enforces record-level sharing
}
```

### Exception Handling

- Always use try-catch blocks for DML operations and callouts.
- Create custom exception classes for specific error scenarios.
- Log exceptions appropriately for debugging and monitoring.
- Provide meaningful error messages to users.

```apex
// Good Example - Proper exception handling
public class AccountService {
    public class AccountServiceException extends Exception {}

    public static void safeUpdate(List<Account> accounts) {
        try {
            if (!Schema.sObjectType.Account.isUpdateable()) {
                throw new AccountServiceException('User does not have permission to update accounts');
            }
            update accounts;
        } catch (DmlException e) {
            System.debug(LoggingLevel.ERROR, 'DML Error: ' + e.getMessage());
            throw new AccountServiceException('Failed to update accounts: ' + e.getMessage());
        }
    }
}
```

### SOQL Best Practices

- Use selective queries with indexed fields (`Id`, `Name`, `OwnerId`, custom indexed fields).
- Limit query results with `LIMIT` clause when appropriate.
- Use `LIMIT 1` when you only need one record.
- Avoid `SELECT *` - always specify required fields.
- Use relationship queries to minimize the number of SOQL queries.
- Order queries by indexed fields when possible.
- **Always use `String.escapeSingleQuotes()`** when using user input in SOQL queries to prevent SOQL injection attacks.
- **Check query selectivity** - Aim for >10% selectivity (filters reduce results to <10% of total records).
- Use **Query Plan** to verify query efficiency and index usage.
- Test queries with realistic data volumes to ensure performance.

```apex
// Good Example - Selective query with indexed fields
List<Account> accounts = [
    SELECT Id, Name, (SELECT Id, LastName FROM Contacts)
    FROM Account
    WHERE OwnerId = :UserInfo.getUserId()
    AND CreatedDate = THIS_MONTH
    LIMIT 100
];

// Good Example - LIMIT 1 for single record
Account account = [SELECT Id, Name FROM Account WHERE Name = 'Acme' LIMIT 1];

// Good Example - escapeSingleQuotes() to prevent SOQL injection
String searchTerm = String.escapeSingleQuotes(userInput);
List<Account> accounts = Database.query('SELECT Id, Name FROM Account WHERE Name LIKE \'%' + searchTerm + '%\'');

// Bad Example - Direct user input without escaping (SECURITY RISK)
List<Account> accounts = Database.query('SELECT Id, Name FROM Account WHERE Name LIKE \'%' + userInput + '%\'');

// Good Example - Selective query with indexed fields (high selectivity)
List<Account> accounts = [
    SELECT Id, Name FROM Account
    WHERE OwnerId = :UserInfo.getUserId()
    AND CreatedDate = TODAY
    LIMIT 100
];

// Bad Example - Non-selective query (scans entire table)
List<Account> accounts = [
    SELECT Id, Name FROM Account
    WHERE Description LIKE '%test%'  // Non-indexed field
];

// Check query performance in Developer Console:
// 1. Enable 'Use Query Plan' in Developer Console
// 2. Run SOQL query and review 'Query Plan' tab
// 3. Look for 'Index' usage vs 'TableScan'
// 4. Ensure selectivity > 10% for optimal performance
```

### Trigger Best Practices

- Use **one trigger per object** to maintain clarity and avoid conflicts.
- Implement trigger logic in handler classes, not directly in triggers.
- Use a trigger framework for consistent trigger management.
- Leverage trigger context variables: `Trigger.new`, `Trigger.old`, `Trigger.newMap`, `Trigger.oldMap`.
- Check trigger context: `Trigger.isBefore`, `Trigger.isAfter`, `Trigger.isInsert`, etc.

```apex
// Good Example - Trigger with handler pattern
trigger AccountTrigger on Account (before insert, before update, after insert, after update) {
    new AccountTriggerHandler().run();
}

// Handler Class
public class AccountTriggerHandler extends TriggerHandler {
    private List<Account> newAccounts;
    private List<Account> oldAccounts;
    private Map<Id, Account> newAccountMap;
    private Map<Id, Account> oldAccountMap;

    public AccountTriggerHandler() {
        this.newAccounts = (List<Account>) Trigger.new;
        this.oldAccounts = (List<Account>) Trigger.old;
        this.newAccountMap = (Map<Id, Account>) Trigger.newMap;
        this.oldAccountMap = (Map<Id, Account>) Trigger.oldMap;
    }

    public override void beforeInsert() {
        AccountService.setDefaultValues(newAccounts);
    }

    public override void afterUpdate() {
        AccountService.handleRatingChange(newAccountMap, oldAccountMap);
    }
}
```

### Code Quality Best Practices

- **Use `isEmpty()`** - Check if collections are empty using built-in methods instead of size comparisons.
- **Use Custom Labels** - Store user-facing text in Custom Labels for internationalization and maintainability.
- **Use Constants** - Define constants for hardcoded values, error messages, and configuration values.
- **Use `String.isBlank()` and `String.isNotBlank()`** - Check for null or empty strings properly.
- **Use `String.valueOf()`** - Safely convert values to strings to avoid null pointer exceptions.
- **Use safe navigation operator `?.`** - Access properties and methods safely without null pointer exceptions.
- **Use null-coalescing operator `??`** - Provide default values for null expressions.
- **Avoid using `+` for string concatenation in loops** - Use `String.join()` for better performance.
- **Use Collection methods** - Leverage `List.clone()`, `Set.addAll()`, `Map.keySet()` for cleaner code.
- **Use ternary operators** - For simple conditional assignments to improve readability.
- **Use switch expressions** - Modern alternative to if-else chains for better readability and performance.
- **Use SObject clone methods** - Properly clone SObjects when needed to avoid unintended references.

```apex
// Good Example - Switch expression (modern Apex)
String rating = switch on account.AnnualRevenue {
    when 0 { 'Cold'; }
    when 1, 2, 3 { 'Warm'; }
    when else { 'Hot'; }
};

// Good Example - Switch on SObjectType
String objectLabel = switch on record {
    when Account a { 'Account: ' + a.Name; }
    when Contact c { 'Contact: ' + c.LastName; }
    when else { 'Unknown'; }
};

// Bad Example - if-else chain
String rating;
if (account.AnnualRevenue == 0) {
    rating = 'Cold';
} else if (account.AnnualRevenue >= 1 && account.AnnualRevenue <= 3) {
    rating = 'Warm';
} else {
    rating = 'Hot';
}

// Good Example - SObject clone methods
Account original = new Account(Name = 'Acme', Industry = 'Technology');

// Shallow clone with ID and relationships
Account clone1 = original.clone(true, true);

// Shallow clone without ID or relationships
Account clone2 = original.clone(false, false);

// Deep clone with all relationships
Account clone3 = original.deepClone(true, true, true);

// Good Example - isEmpty() instead of size comparison
if (accountList.isEmpty()) {
    System.debug('No accounts found');
}

// Bad Example - size comparison
if (accountList.size() == 0) {
    System.debug('No accounts found');
}

// Good Example - Custom Labels for user-facing text
final String ERROR_MESSAGE = System.Label.Account_Update_Error;
final String SUCCESS_MESSAGE = System.Label.Account_Update_Success;

// Bad Example - Hardcoded strings
final String ERROR_MESSAGE = 'An error occurred while updating the account';

// Good Example - Constants for configuration values
public class AccountService {
    private static final Integer MAX_RETRY_ATTEMPTS = 3;
    private static final String DEFAULT_INDUSTRY = 'Technology';
    private static final String ERROR_PREFIX = 'AccountService Error: ';

    public static void processAccounts() {
        // Use constants
        if (retryCount > MAX_RETRY_ATTEMPTS) {
            throw new AccountServiceException(ERROR_PREFIX + 'Max retries exceeded');
        }
    }
}

// Good Example - isBlank() for null and empty checks
if (String.isBlank(account.Name)) {
    account.Name = DEFAULT_NAME;
}

// Bad Example - multiple null checks
if (account.Name == null || account.Name == '') {
    account.Name = DEFAULT_NAME;
}

// Good Example - String.valueOf() for safe conversion
String accountId = String.valueOf(account.Id);
String revenue = String.valueOf(account.AnnualRevenue);

// Good Example - Safe navigation operator (?.)
String ownerName = account?.Owner?.Name;
Integer contactCount = account?.Contacts?.size();

// Bad Example - Nested null checks
String ownerName;
if (account != null && account.Owner != null) {
    ownerName = account.Owner.Name;
}

// Good Example - Null-coalescing operator (??)
String accountName = account?.Name ?? 'Unknown Account';
Integer revenue = account?.AnnualRevenue ?? 0;
String industry = account?.Industry ?? DEFAULT_INDUSTRY;

// Bad Example - Ternary with null check
String accountName = account != null && account.Name != null ? account.Name : 'Unknown Account';

// Good Example - Combining ?. and ??
String email = contact?.Email ?? contact?.Account?.Owner?.Email ?? 'no-reply@example.com';

// Good Example - String concatenation in loops
List<String> accountNames = new List<String>();
for (Account acc : accounts) {
    accountNames.add(acc.Name);
}
String result = String.join(accountNames, ', ');

// Bad Example - String concatenation in loops
String result = '';
for (Account acc : accounts) {
    result += acc.Name + ', '; // Poor performance
}

// Good Example - Ternary operator
String status = isActive ? 'Active' : 'Inactive';

// Good Example - Collection methods
List<Account> accountsCopy = accountList.clone();
Set<Id> accountIds = new Set<Id>(accountMap.keySet());
```

### Recursion Prevention

- **Use static variables** to track recursive calls and prevent infinite loops.
- Implement a **circuit breaker** pattern to stop execution after a threshold.
- Document recursion limits and potential risks.

```apex
// Good Example - Recursion prevention with static variable
public class AccountTriggerHandler extends TriggerHandler {
    private static Boolean hasRun = false;

    public override void afterUpdate() {
        if (!hasRun) {
            hasRun = true;
            AccountService.updateRelatedContacts(Trigger.newMap.keySet());
        }
    }
}

// Good Example - Circuit breaker with counter
public class OpportunityService {
    private static Integer recursionCount = 0;
    private static final Integer MAX_RECURSION_DEPTH = 5;

    public static void processOpportunity(Id oppId) {
        recursionCount++;

        if (recursionCount > MAX_RECURSION_DEPTH) {
            System.debug(LoggingLevel.ERROR, 'Max recursion depth exceeded');
            return;
        }

        try {
            // Process opportunity logic
        } finally {
            recursionCount--;
        }
    }
}
```

### Method Visibility and Encapsulation

- **Use `private` by default** - Only expose methods that need to be public.
- Use `protected` for methods that subclasses need to access.
- Use `public` only for APIs that other classes need to call.
- **Use `final` keyword** to prevent method override when appropriate.
- Mark classes as `final` if they should not be extended.

```apex
// Good Example - Proper encapsulation
public class AccountService {
    // Public API
    public static void updateAccounts(List<Account> accounts) {
        validateAccounts(accounts);
        performUpdate(accounts);
    }

    // Private helper - not exposed
    private static void validateAccounts(List<Account> accounts) {
        for (Account acc : accounts) {
            if (String.isBlank(acc.Name)) {
                throw new IllegalArgumentException('Account name is required');
            }
        }
    }

    // Private implementation - not exposed
    private static void performUpdate(List<Account> accounts) {
        update accounts;
    }
}

// Good Example - Final keyword to prevent extension
public final class UtilityHelper {
    // Cannot be extended
    public static String formatCurrency(Decimal amount) {
        return '$' + amount.setScale(2);
    }
}

// Good Example - Final method to prevent override
public virtual class BaseService {
    // Can be overridden
    public virtual void process() {
```

---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/apex-full.md](../docs/rule-references/apex-full.md). Read that file on demand when deeper details are needed.
