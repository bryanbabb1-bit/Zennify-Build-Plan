# Standard: Salesforce Naming Conventions

**Category:** Naming Conventions
**Status:** Active

---

## Custom Objects

- PascalCase, no spaces, `__c` suffix auto-applied by Salesforce
- Example: `AdvisorRelationship__c`, `HouseholdPlan__c`
- Prefix with project/module code if org has multiple workstreams: `ZEN_AdvisorRelationship__c`

## Custom Fields

- PascalCase, descriptive, no abbreviations unless industry-standard
- Example: `AnnualReviewDate__c`, `RiskToleranceScore__c`

## Flows

- `[Object]_[Trigger]_[Action]` pattern
- Example: `Opportunity_BeforeInsert_SetDefaultValues`
- Record-triggered flows: prefix with `RT_`
- Screen flows: prefix with `SCR_`
- Auto-launched: prefix with `AL_`

## Apex Classes

- PascalCase
- Controllers: `[Feature]Controller`
- Services: `[Feature]Service`
- Handlers: `[Object]TriggerHandler`
- Tests: `[ClassName]Test`

## Apex Triggers

- One trigger per object: `[ObjectName]Trigger`
- All logic delegated to handler class

## Permission Sets

- `[Role]_[Scope]` pattern
- Example: `FinancialAdvisor_ReadWrite`, `BranchManager_Admin`

## Profiles

- Minimize custom profiles — use Permission Sets instead
- If profiles needed: `Zennify_[Role]`

---
*Upload this document in the Build Planner admin panel under Standards > Naming Conventions.*
