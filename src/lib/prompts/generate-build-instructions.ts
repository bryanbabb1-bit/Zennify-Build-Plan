export function buildInstructionsPrompt(context: string, epics: string, design: string): string {
  return `Based on the solution design and epics, generate step-by-step build instructions for this Salesforce project implementation.

These instructions will be used by:
1. Salesforce developers/admins following the implementation plan
2. AI coding tools (Windsurf, Claude Code) to configure and build

Structure instructions by phase:
- setup: Org setup, package installs, namespace configuration, sandbox strategy
- config: Declarative configuration (custom objects, fields, page layouts, record types, profiles/permission sets)
- integration: MuleSoft flows, connected apps, named credentials, external services
- testing: Test class requirements, UAT scripts, data validation
- deploy: Deployment sequence, change sets or Gearset pipeline, post-deploy steps

Make instructions specific and actionable. Include Salesforce Setup menu paths, API names, and configuration values where applicable.

CLIENT CONTEXT:
${context}

EPICS:
${epics}

SOLUTION DESIGN:
${design}`
}

export const buildInstructionsToolSchema = {
  properties: {
    instructions: {
      type: "array",
      description: "Ordered list of build instructions grouped by phase",
      items: {
        type: "object",
        required: ["title", "phase", "content"],
        properties: {
          title: { type: "string", description: "Instruction title" },
          phase: {
            type: "string",
            enum: ["setup", "config", "integration", "testing", "deploy"],
          },
          content: {
            type: "string",
            description: "Detailed step-by-step instructions in markdown format. Include code snippets, setup paths, and specific values.",
          },
          epicTitle: {
            type: "string",
            description: "Optional: which epic this instruction primarily supports",
          },
        },
      },
    },
  },
  required: ["instructions"],
} as const
