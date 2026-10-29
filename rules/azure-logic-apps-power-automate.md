---
trigger: model_decision
description: Guidelines for developing Azure Logic Apps and Power Automate workflows with best practices for Workflow Definition Language (WDL), integration patterns, and enterprise automation. Applies to files matching **/*.json, **/*.logicapp.json, **/workflow.json, **/*-definition.json, **/*.flow.json.
source_url: https://github.com/github/awesome-copilot
source_path: instructions/azure-logic-apps-power-automate.instructions.md
source_commit: 0fe6545b950671641b2b14b44eb56678fea6c6b4
source_license: MIT
source_copyright: Copyright GitHub, Inc.
source_author: Troy Simeon Taylor
converted_at: 2026-10-28T21:19:51.599Z
converter_version: 0.1.0
status: draft
---

Apply this rule when working on files matching: `**/*.json`, `**/*.logicapp.json`, `**/workflow.json`, `**/*-definition.json`, `**/*.flow.json`.

# Azure Logic Apps and Power Automate Instructions

## Overview

These instructions will guide you in writing high-quality Azure Logic Apps and Microsoft Power Automate workflow definitions using the JSON-based Workflow Definition Language (WDL). Azure Logic Apps is a cloud-based integration platform as a service (iPaaS) that provides 1,400+ connectors to simplify integration across services and protocols. Follow these guidelines to create robust, efficient, and maintainable cloud workflow automation solutions.

## Workflow Definition Language Structure

When working with Logic Apps or Power Automate flow JSON files, ensure your workflow follows this standard structure:

```json
{
  "definition": {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "actions": { },
    "contentVersion": "1.0.0.0",
    "outputs": { },
    "parameters": { },
    "staticResults": { },
    "triggers": { }
  },
  "parameters": { }
}
```

## Best Practices for Azure Logic Apps and Power Automate Development

### 1. Triggers

- **Use appropriate trigger types** based on your scenario:
  - **Request trigger**: For synchronous API-like workflows
  - **Recurrence trigger**: For scheduled operations
  - **Event-based triggers**: For reactive patterns (Service Bus, Event Grid, etc.)
- **Configure proper trigger settings**:
  - Set reasonable timeout periods
  - Use pagination settings for high-volume data sources
  - Implement proper authentication

```json
"triggers": {
  "manual": {
    "type": "Request",
    "kind": "Http",
    "inputs": {
      "schema": {
        "type": "object",
        "properties": {
          "requestParameter": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

### 2. Actions

- **Name actions descriptively** to indicate their purpose
- **Organize complex workflows** using scopes for logical grouping
- **Use proper action types** for different operations:
  - HTTP actions for API calls
  - Connector actions for built-in integrations
  - Data operation actions for transformations

```json
"actions": {
  "Get_Customer_Data": {
    "type": "Http",
    "inputs": {
      "method": "GET",
      "uri": "https://api.example.com/customers/@{triggerBody()?['customerId']}",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "runAfter": {}
  }
}
```

### 3. Error Handling and Reliability

- **Implement robust error handling**:
  - Use "runAfter" configurations to handle failures
  - Configure retry policies for transient errors
  - Use scopes with "runAfter" conditions for error branches
- **Implement fallback mechanisms** for critical operations
- **Add timeouts** for external service calls
- **Use runAfter conditions** for complex error handling scenarios

```json
"actions": {
  "HTTP_Action": {
    "type": "Http",
    "inputs": { },
    "retryPolicy": {
      "type": "fixed",
      "count": 3,
      "interval": "PT20S",
      "minimumInterval": "PT5S",
      "maximumInterval": "PT1H"
    }
  },
  "Handle_Success": {
    "type": "Scope",
    "actions": { },
    "runAfter": {
      "HTTP_Action": ["Succeeded"]
    }
  },
  "Handle_Failure": {
    "type": "Scope",
    "actions": {
      "Log_Error": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['loganalytics']['connectionId']"
            }
          },
          "method": "post",
          "body": {
            "LogType": "WorkflowError",
            "ErrorDetails": "@{actions('HTTP_Action').outputs.body}",
            "StatusCode": "@{actions('HTTP_Action').outputs.statusCode}"
          }
        }
      },
      "Send_Notification": {
        "type": "ApiConnection",
        "inputs": {
          "host": {
            "connection": {
              "name": "@parameters('$connections')['office365']['connectionId']"
            }
          },
          "method": "post",
          "path": "/v2/Mail",
          "body": {
            "To": "support@contoso.com",
            "Subject": "Workflow Error - HTTP Call Failed",
            "Body": "<p>The HTTP call failed with status code: @{actions('HTTP_Action').outputs.statusCode}</p>"
          }
        },
        "runAfter": {
          "Log_Error": ["Succeeded"]
        }
      }
    },
    "runAfter": {
      "HTTP_Action": ["Failed", "TimedOut"]
    }
  }
}
```

### 4. Expressions and Functions

- **Use built-in expression functions** to transform data
- **Keep expressions concise and readable**
- **Document complex expressions** with comments

Common expression patterns:
- String manipulation: `concat()`, `replace()`, `substring()`
- Collection operations: `filter()`, `map()`, `select()`
- Conditional logic: `if()`, `and()`, `or()`, `equals()`
- Date/time manipulation: `formatDateTime()`, `addDays()`
- JSON handling: `json()`, `array()`, `createArray()`

```json
"Set_Variable": {
  "type": "SetVariable",
  "inputs": {
    "name": "formattedData",
    "value": "@{map(body('Parse_JSON'), item => {
      return {
        id: item.id,
        name: toUpper(item.name),
        date: formatDateTime(item.timestamp, 'yyyy-MM-dd')
      }
    })}"
  }
}
```

#### Using Expressions in Power Automate Conditions

Power Automate supports advanced expressions in conditions to check multiple values. When working with complex logical conditions, use the following pattern:

- For comparing a single value: Use the basic condition designer interface
- For multiple conditions: Use advanced expressions in advanced mode

Common logical expression functions for conditions in Power Automate:

| Expression | Description | Example |
|------------|-------------|---------|
| `and` | Returns true if both arguments are true | `@and(equals(item()?['Status'], 'completed'), equals(item()?['Assigned'], 'John'))` |
| `or` | Returns true if either argument is true | `@or(equals(item()?['Status'], 'completed'), equals(item()?['Status'], 'unnecessary'))` |
| `equals` | Checks if values are equal | `@equals(item()?['Status'], 'blocked')` |
| `greater` | Checks if first value is greater than second | `@greater(item()?['Due'], item()?['Paid'])` |
| `less` | Checks if first value is less than second | `@less(item()?['dueDate'], addDays(utcNow(),1))` |
| `empty` | Checks if object, array or string is empty | `@empty(item()?['Status'])` |
| `not` | Returns opposite of a boolean value | `@not(contains(item()?['Status'], 'Failed'))` |

Example: Check if a status is "completed" OR "unnecessary":
```
@or(equals(item()?['Status'], 'completed'), equals(item()?['Status'], 'unnecessary'))
```

Example: Check if status is "blocked" AND assigned to specific person:
```
@and(equals(item()?['Status'], 'blocked'), equals(item()?['Assigned'], 'John Wonder'))
```

Example: Check if a payment is overdue AND incomplete:
```
@and(greater(item()?['Due'], item()?['Paid']), less(item()?['dueDate'], utcNow()))
```

**Note:** In Power Automate, when accessing dynamic values from previous steps in expressions, use the syntax `item()?['PropertyName']` to safely access properties in a collection.

### 5. Parameters and Variables

- **Parameterize your workflows** for reusability across environments
- **Use variables for temporary values** within a workflow
- **Define clear parameter schemas** with default values and descriptions

```json
"parameters": {
  "apiEndpoint": {
    "type": "string",
    "defaultValue": "https://api.dev.example.com",
    "metadata": {
      "description": "The base URL for the API endpoint"
    }
  }
},
"variables": {
  "requestId": "@{guid()}",
  "processedItems": []
}
```

### 6. Control Flow

- **Use conditions** for branching logic
- **Implement parallel branches** for independent operations
- **Use foreach loops** with reasonable batch sizes for collections
- **Apply until loops** with proper exit conditions

```json
"Process_Items": {
  "type": "Foreach",
  "foreach": "@body('Get_Items')",
  "actions": {
    "Process_Single_Item": {
      "type": "Scope",
      "actions": { }
    }
  },
  "runAfter": {
    "Get_Items": ["Succeeded"]
  },
  "runtimeConfiguration": {
    "concurrency": {
      "repetitions": 10
    }
  }
}
```

### 7. Content and Message Handling

- **Validate message schemas** to ensure data integrity
- **Implement proper content type handling**
- **Use Parse JSON actions** to work with structured data

```json
"Parse_Response": {
  "type": "ParseJson",
  "inputs": {
    "content": "@body('HTTP_Request')",
    "schema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "data": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": { }
          }
        }
      }
    }
  }
}
```

### 8. Security Best Practices

- **Use managed identities** when possible
- **Store secrets in Key Vault**
- **Implement least privilege access** for connections
- **Secure API endpoints** with authentication
- **Implement IP restrictions** for HTTP triggers
- **Apply data encryption** for sensitive data in parameters and messages
- **Use Azure RBAC** to control access to Logic Apps resources
- **Conduct regular security reviews** of workflows and connections

```json
"Get_Secret": {
  "type": "ApiConnection",
  "inputs": {
    "host": {
      "connection": {
        "name": "@parameters('$connections')['keyvault']['connectionId']"
      }
    },
    "method": "get",
    "path": "/secrets/@{encodeURIComponent('apiKey')}/value"
  }
},
"Call_Protected_API": {
  "type": "Http",
  "inputs": {
    "method": "POST",
    "uri": "https://api.example.com/protected",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer @{body('Get_Secret')?['value']}"
    },
    "body": {
      "data": "@variables('processedData')"
    }
  },
  "authentication": {
    "type": "ManagedServiceIdentity"
  },
  "runAfter": {
    "Get_Secret": ["Succeeded"]
  }
}
```

## Performance Optimization

- **Minimize unnecessary actions**
- **Use batch operations** when available
- **Optimize expressions** to reduce complexity
- **Configure appropriate timeout values**
- **Implement pagination** for large data sets
- **Implement concurrency control** for parallelizable operations

```json
"Process_Items": {
  "type": "Foreach",
  "foreach": "@body('Get_Items')",
  "actions": {
    "Process_Single_Item": {
      "type": "Scope",
      "actions": { }
    }
  },
  "runAfter": {
    "Get_Items": ["Succeeded"]
  },
  "runtimeConfiguration": {
    "concurrency": {
      "repetitions": 10
    }
  }
}
```

### Workflow Design Best Practices

- **Limit workflows to 50 actions or less** for optimal designer performance
- **Split complex business logic** into multiple smaller workflows when necessary
- **Use deployment slots** for mission-critical logic apps that require zero downtime deployments
- **Avoid hardcoded properties** in trigger and action definitions
- **Add descriptive comments** to provide context about trigger and action definitions
- **Use built-in operations** when available instead of shared connectors for better performance
- **Use an Integration Account** for B2B scenarios and EDI message processing
- **Reuse workflow templates** for standard patterns across your organization
- **Avoid deep nesting** of scopes and actions to maintain readability

### Monitoring and Observability

- **Configure diagnostic settings** to capture workflow runs and metrics
- **Add tracking IDs** to correlate related workflow runs
- **Implement comprehensive logging** with appropriate detail levels
- **Set up alerts** for workflow failures and performance degradation
- **Use Application Insights** for end-to-end tracing and monitoring

## Platform Types and Considerations

### Azure Logic Apps vs Power Automate

While Azure Logic Apps and Power Automate share the same underlying workflow engine and language, they have different target audiences and capabilities:

- **Power Automate**: 
  - User-friendly interface for business users
  - Part of the Power Platform ecosystem
  - Integration with Microsoft 365 and Dynamics 365
  - Desktop flow capabilities for UI automation

- **Azure Logic Apps**:
  - Enterprise-grade integration platform
  - Developer-focused with advanced capabilities
  - Deeper Azure service integration
  - More extensive monitoring and operations capabilities

### Logic App Types

#### Consumption Logic Apps
- Pay-per-execution pricing model
- Serverless architecture
- Suitable for variable or unpredictable workloads

#### Standard Logic Apps
- Fixed pricing based on App Service Plan
- Predictable performance
- Local development support
- Integration with VNets

#### Integration Service Environment (ISE)
- Dedicated deployment environment
- Higher throughput and longer execution durations
- Direct access to VNet resources
- Isolated runtime environment

### Power Automate License Types
- **Power Automate per user plan**: For individual users
- **Power Automate per flow plan**: For specific workflows
- **Power Automate Process plan**: For RPA capabilities
- **Power Automate included with Office 365**: Limited capabilities for Office 365 users

## Common Integration Patterns

### Architectural Patterns
- **Mediator Pattern**: Use Logic Apps/Power Automate as an orchestration layer between systems
- **Content-Based Routing**: Route messages based on content to different destinations
- **Message Transformation**: Transform messages between formats (JSON, XML, EDI, etc.)
- **Scatter-Gather**: Distribute work in parallel and aggregate results
- **Protocol Bridging**: Connect systems with different protocols (REST, SOAP, FTP, etc.)
- **Claim Check**: Store large payloads externally in blob storage or databases
- **Saga Pattern**: Manage distributed transactions with compensating actions for failures
- **Choreography Pattern**: Coordinate multiple services without a central orchestrator

### Action Patterns
- **Asynchronous Processing Pattern**: For long-running operations
  ```json
  "LongRunningAction": {
    "type": "Http",
    "inputs": {
      "method": "POST",
      "uri": "https://api.example.com/longrunning",
      "body": { "data": "@triggerBody()" }
    },
    "retryPolicy": {
      "type": "fixed",
      "count": 3,
      "interval": "PT30S"
    }
  }
  ```

- **Webhook Pattern**: For callback-based processing
  ```json
  "WebhookAction": {
    "type": "ApiConnectionWebhook",
    "inputs": {
      "host": {
        "connection": {
          "name": "@parameters('$connections')['servicebus']['connectionId']"
        }
      },
      "body": {
        "content": "@triggerBody()"
      },
      "path": "/subscribe/topics/@{encodeURIComponent('mytopic')}/subscriptions/@{encodeURIComponent('mysubscription')}"
    }
  }
  ```

### Enterprise Integration Patterns
- **B2B Message Exchange**: Exchange EDI documents between trading partners (AS2, X12, EDIFACT)
- **Integration Account**: Use for storing and managing B2B artifacts (agreements, schemas, maps)
- **Rules Engine**: Implement complex business rules using the Azure Logic Apps Rules Engine
- **Message Validation**: Validate messages against schemas for compliance and data integrity
- **Transaction Processing**: Process business transactions with compensating transactions for rollback

## DevOps and CI/CD for Logic Apps

### Source Control and Versioning

- **Store Logic App definitions in source control** (Git, Azure DevOps, GitHub)
- **Use ARM templates** for deployment to multiple environments
- **Implement branching strategies** appropriate for your release cadence
- **Version your Logic Apps** using tags or version properties

### Automated Deployment

- **Use Azure DevOps pipelines** or GitHub Actions for automated deployments
- **Implement parameterization** for environment-specific values
- **Use deployment slots** for zero-downtime deployments
- **Include post-deployment validation** tests in your CI/CD pipeline

```yaml
# Example Azure DevOps YAML pipeline for Logic App deployment
trigger:
  branches:
    include:
    - main
    - release/*

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: AzureResourceManagerTemplateDeployment@3
  inputs:
    deploymentScope: 'Resource Group'
    azureResourceManagerConnection: 'Your-Azure-Connection'
    subscriptionId: '$(subscriptionId)'
    action: 'Create Or Update Resource Group'
    resourceGroupName: '$(resourceGroupName)'
    location: '$(location)'
    templateLocation: 'Linked artifact'
    csmFile: '$(System.DefaultWorkingDirectory)/arm-templates/logicapp-template.json'
    csmParametersFile: '$(System.DefaultWorkingDirectory)/arm-templates/logicapp-parameters-$(Environment).json'
    deploymentMode: 'Incremental'
```

## Cross-Platform Considerations

When working with both Azure Logic Apps and Power Automate:

- **Export/Import Compatibility**: Flows can be exported from Power Automate and imported into Logic Apps, but some modifications may be required
- **Connector Differences**: Some connectors are available in one platform but not the other
- **Environment Isolation**: Power Automate environments provide isolation and may have different policies
- **ALM Practices**: Consider using Azure DevOps for Logic Apps and Solutions for Power Automate

### Migration Strategies

- **Assessment**: Evaluate complexity and suitability for migration
- **Connector Mapping**: Map connectors between platforms and identify gaps
- **Testing Strategy**: Implement parallel testing before cutover
- **Documentation**: Document all configuration changes for reference

```json
// Example Power Platform solution structure for Power Automate flows
{
  "SolutionName": "MyEnterpriseFlows",
  "Version": "1.0.0",
  "Flows": [
    {
      "Name": "OrderProcessingFlow",
      "Type": "Microsoft.Flow/flows",
      "Properties": {
        "DisplayName": "Order Processing Flow",
        "DefinitionData": {
          "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
          "triggers": {
            "When_a_new_order_is_created": {
              "type": "ApiConnectionWebhook",
              "inputs": {
                "host": {
```

---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/azure-logic-apps-power-automate-full.md](../docs/rule-references/azure-logic-apps-power-automate-full.md). Read that file on demand when deeper details are needed.
