import type { Outcome } from "@/types"

export function buildOutcomesPrompt(context: string): string {
  return `Based on the following client discovery information for a Salesforce implementation project, identify 4-7 high-level business outcomes this project should achieve.

Each outcome represents a strategic business result — not a technical task. Frame outcomes from the client's business perspective.

Categories to consider:
- operational_efficiency: Streamline processes, reduce manual work, improve team productivity
- client_experience: Improve how the client serves their end customers (account holders, borrowers, policyholders, etc.)
- compliance: Meet regulatory requirements, reduce compliance risk, improve auditability
- revenue_growth: Enable cross-sell/upsell, improve advisor productivity, increase AUM/premium

CLIENT DISCOVERY INFORMATION:
${context}

Generate outcomes that are specific to this client's industry, pain points, and Salesforce landscape.`
}

export const outcomesToolSchema = {
  properties: {
    outcomes: {
      type: "array",
      description: "List of business outcomes for the project",
      items: {
        type: "object",
        required: ["title", "description", "category", "priority"],
        properties: {
          title: { type: "string", description: "Short outcome title, e.g. 'Unified 360° Client View'" },
          description: { type: "string", description: "2-3 sentence description of what this outcome means for the business" },
          category: {
            type: "string",
            enum: ["operational_efficiency", "client_experience", "compliance", "revenue_growth"],
          },
          priority: { type: "string", enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
        },
      },
    },
  },
  required: ["outcomes"],
} as const

export interface OutcomesResult {
  outcomes: Array<Pick<Outcome, "title" | "description" | "category" | "priority">>
}
