# Standard: Salesforce Architecture Patterns

**Category:** Architecture Patterns
**Status:** Active

---

## Core Principles

1. **Declarative first** — Use Flow before Apex. Use Apex before external code.
2. **Bulkified always** — All Apex must handle 200+ records
3. **One trigger per object** — Handler pattern, no logic in trigger body
4. **No hardcoded IDs** — Use Custom Metadata or Custom Settings
5. **API-first integrations** — Named Credentials for all external callouts

## Recommended Patterns

### Trigger Pattern
```
[Object]Trigger → [Object]TriggerHandler → [Object]Service
```

### Integration Pattern
- Use Platform Events for async, decoupled integrations
- Use Named Credentials + External Services for REST APIs
- MuleSoft for complex multi-system orchestration

### Data Model (FSC)
- Leverage standard FSC objects before creating custom:
  - `FinServ__FinancialAccount__c`
  - `FinServ__FinancialGoal__c`
  - `FinServ__Household__c`
  - `FinServ__ReciprocalRole__c`
- Extend with custom fields, not custom objects, where possible

### Security Model
- Profiles: Minimum viable, org-wide defaults restrictive
- Permission Sets: Role-based access grants
- Sharing Rules: Criteria-based for advisor → household relationships
- Field-Level Security: Set at Permission Set level

## What to Avoid

- SOQL/DML inside loops
- Hardcoded record type IDs or user IDs
- Page layouts as security controls (use FLS)
- Workflow Rules (deprecated — migrate to Flow)
- Process Builder (deprecated — migrate to Flow)

---
*Upload this document in the Build Planner admin panel under Standards > Architecture Patterns.*
