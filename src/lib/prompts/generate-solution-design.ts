export function buildSolutionDesignPrompt(context: string, outcomes: string, epics: string): string {
  return `Based on the client discovery information, outcomes, and epics, create a comprehensive Salesforce solution design for this financial services project.

Be specific about:
- Which Salesforce clouds and editions are recommended and why
- Integration architecture (MuleSoft, direct API, middleware, ETL patterns)
- Custom objects needed (with key fields)
- Security model design (profiles, permission sets, sharing rules for financial data)
- Data architecture considerations (financial account data model, household model, compliance data)

CLIENT DISCOVERY INFORMATION:
${context}

BUSINESS OUTCOMES:
${outcomes}

EPICS SCOPE:
${epics}

Design a solution that follows Salesforce best practices and meets financial services regulatory requirements.`
}

export const solutionDesignToolSchema = {
  properties: {
    recommendedClouds: {
      type: "array",
      description: "Salesforce clouds and products recommended for this project",
      items: {
        type: "object",
        required: ["cloud", "tier", "rationale"],
        properties: {
          cloud: { type: "string", description: "e.g. 'Financial Services Cloud', 'MuleSoft Anypoint Platform'" },
          tier: { type: "string", description: "Edition/tier, e.g. 'Enterprise', 'Growth', 'Unlimited'" },
          rationale: { type: "string", description: "Why this cloud/edition is recommended for this client" },
        },
      },
    },
    integrations: {
      type: "array",
      description: "Integration touchpoints between Salesforce and other systems",
      items: {
        type: "object",
        required: ["system", "pattern", "direction", "notes"],
        properties: {
          system: { type: "string", description: "External system name, e.g. 'Core Banking System', 'Jack Henry Symitar'" },
          pattern: { type: "string", description: "Integration pattern: REST API | MuleSoft | Heroku Connect | ETL | Real-time event" },
          direction: { type: "string", enum: ["Salesforce → System", "System → Salesforce", "Bidirectional"] },
          notes: { type: "string", description: "Key design decisions, data sync frequency, field mappings" },
        },
      },
    },
    customObjects: {
      type: "array",
      description: "Custom Salesforce objects needed beyond standard FSC/Sales Cloud objects",
      items: {
        type: "object",
        required: ["object", "purpose", "keyFields"],
        properties: {
          object: { type: "string", description: "API name, e.g. 'Loan_Application__c'" },
          purpose: { type: "string", description: "What business data this object stores" },
          keyFields: {
            type: "array",
            items: { type: "string" },
            description: "Important fields on this object",
          },
        },
      },
    },
    dataArchitecture: {
      type: "object",
      description: "Key data architecture decisions",
      properties: {
        householdModel: { type: "string", description: "How client household/relationship data is modeled" },
        financialDataModel: { type: "string", description: "How financial accounts, policies, or loans are structured" },
        dataGovernance: { type: "string", description: "Data quality, deduplication, and master data management approach" },
        retentionCompliance: { type: "string", description: "Data retention and regulatory compliance considerations" },
      },
    },
    securityModel: {
      type: "object",
      description: "Salesforce security design",
      properties: {
        profileStrategy: { type: "string", description: "Profile structure and rationale" },
        permissionSets: {
          type: "array",
          items: { type: "string" },
          description: "Key permission sets needed",
        },
        sharingModel: { type: "string", description: "OWD settings and sharing rule approach for financial data" },
        fieldLevelSecurity: { type: "string", description: "Sensitive field security considerations (SSN, account numbers, etc.)" },
      },
    },
    narrativeSummary: {
      type: "string",
      description: "2-3 paragraph executive summary of the solution design approach",
    },
  },
  required: ["recommendedClouds", "integrations", "customObjects", "narrativeSummary"],
} as const
