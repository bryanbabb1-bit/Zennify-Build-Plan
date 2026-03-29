export function buildEpicsStoriesPrompt(context: string, outcomes: string): string {
  return `Based on the client discovery information and the business outcomes identified, generate user epics and user stories for this Salesforce implementation project.

STORY FORMAT: "As a [specific role], I want [specific action/feature], so that [specific business benefit]."

RULES:
- Each epic should map to one or more outcomes
- Each epic should have 3-8 user stories
- User roles should be specific (e.g., "Relationship Manager", "Loan Processor", "Compliance Officer", "Branch Manager", "Client")
- Acceptance criteria should be specific, testable conditions (3-5 per story)
- Story points: use Fibonacci scale (1=trivial, 2=simple, 3=moderate, 5=complex, 8=very complex, 13=epic-scale)
- sfObjects: list relevant Salesforce standard or custom objects (e.g., "Account", "Contact", "FinancialAccount__c")
- sfFeatures: list Salesforce features/capabilities involved (e.g., "Flows", "OmniStudio", "Einstein Next Best Action", "FSC Referrals")
- Salesforce clouds: be specific about which SF products each epic involves

CLIENT DISCOVERY INFORMATION:
${context}

IDENTIFIED OUTCOMES:
${outcomes}

Generate comprehensive epics and stories that cover the full scope of the project.`
}

export const epicsStoriesToolSchema = {
  properties: {
    epics: {
      type: "array",
      description: "List of user epics",
      items: {
        type: "object",
        required: ["title", "description", "sfClouds", "priority", "outcomeIndex", "stories"],
        properties: {
          title: { type: "string", description: "Epic title, e.g. 'Client 360 Profile'" },
          description: { type: "string", description: "What this epic delivers and why" },
          sfClouds: {
            type: "array",
            items: { type: "string" },
            description: "Salesforce products involved, e.g. ['FSC', 'Sales Cloud', 'Experience Cloud']",
          },
          priority: { type: "string", enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
          outcomeIndex: {
            type: "number",
            description: "Zero-based index of the outcome this epic primarily maps to",
          },
          stories: {
            type: "array",
            description: "User stories within this epic",
            items: {
              type: "object",
              required: ["userRole", "action", "benefit", "acceptanceCriteria", "type", "priority", "storyPoints", "sfObjects", "sfFeatures"],
              properties: {
                userRole: { type: "string", description: "The user role, e.g. 'Relationship Manager'" },
                action: { type: "string", description: "What they want to do" },
                benefit: { type: "string", description: "The business benefit" },
                acceptanceCriteria: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 specific, testable acceptance criteria",
                },
                type: { type: "string", enum: ["FEATURE", "TASK", "SPIKE"] },
                priority: { type: "string", enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
                storyPoints: { type: "number", enum: [1, 2, 3, 5, 8, 13] },
                sfObjects: {
                  type: "array",
                  items: { type: "string" },
                  description: "Salesforce objects involved",
                },
                sfFeatures: {
                  type: "array",
                  items: { type: "string" },
                  description: "Salesforce features/capabilities involved",
                },
              },
            },
          },
        },
      },
    },
  },
  required: ["epics"],
} as const

export interface StoryInput {
  userRole: string
  action: string
  benefit: string
  acceptanceCriteria: string[]
  type: "FEATURE" | "TASK" | "SPIKE"
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  storyPoints: number
  sfObjects: string[]
  sfFeatures: string[]
}

export interface EpicInput {
  title: string
  description: string
  sfClouds: string[]
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  outcomeIndex: number
  stories: StoryInput[]
}

export interface EpicsStoriesResult {
  epics: EpicInput[]
}
