# Standard: Financial Services Cloud Best Practices

**Category:** Financial Services
**Status:** Active

---

## FSC Data Model Essentials

### Key Objects
| Object | Purpose |
|---|---|
| `FinServ__FinancialAccount__c` | Bank accounts, investment accounts, loans |
| `FinServ__FinancialGoal__c` | Client financial goals (retirement, education, etc.) |
| `FinServ__Household__c` | Household grouping (Account with RecordType = Household) |
| `FinServ__FinancialAccountRole__c` | Junction: Person → Account relationship |
| `FinServ__ReciprocalRole__c` | Relationship definitions (Spouse, Beneficiary, etc.) |
| `FinServ__AssetsAndLiabilities__c` | Net worth tracking |

### Relationship Model
- Household is the primary entity, not the individual
- Individuals linked to Household via `AccountContactRelation`
- Advisors linked to clients via `FinServ__ExternalAdvisorAccount__c`

## Common Configurations

### Household Rollups
- Enable rollup summaries for AUM, total accounts, goals
- Use FSC Data Processing Engine for complex rollups

### Action Plans
- Use Action Plans for repeatable advisory workflows (annual reviews, onboarding)

### Compliant Data Sharing
- Use FSC Compliant Data Sharing for branch/advisor hierarchy
- Configure sharing sets appropriately for Experience Cloud portals

## Regulatory Considerations

- **FINRA**: Document storage, audit trail requirements → use Salesforce Files + ContentVersion
- **GDPR/CCPA**: Individual object consent fields, data retention policies
- **SOC 2**: Audit trail via Field History Tracking + Shield (if licensed)

## FSC-Specific Story Tags

When generating stories for FSC engagements, tag with relevant features:
- `FSC_Households`
- `FSC_FinancialAccounts`
- `FSC_Goals`
- `FSC_ActionPlans`
- `FSC_RelationshipMap`
- `FSC_DataProcessingEngine`
- `FSC_CompliantDataSharing`

---
*Upload this document in the Build Planner admin panel under Standards > Financial Services.*
