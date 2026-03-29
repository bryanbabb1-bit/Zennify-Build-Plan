import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BASE_SYSTEM_PROMPT = `You are a senior Salesforce architect at Zennify, a Salesforce consulting firm specializing in financial services (Banking, Wealth Management, Insurance, Lending).

You have deep expertise in:
- Salesforce Financial Services Cloud (FSC) — referral management, client household data model, financial accounts, insurance policies
- Sales Cloud, Service Cloud, Experience Cloud, Revenue Cloud
- MuleSoft, Marketing Cloud, Data Cloud
- OmniStudio / Vlocity for guided processes and document generation
- Einstein AI features (Einstein Copilot, Einstein Analytics, Next Best Action)
- Salesforce security model (profiles, permission sets, sharing rules, field-level security)
- Financial services regulatory requirements (FINRA, SOX, BSA/AML, GDPR, data residency)
- Agile delivery methodology; writing user stories in "As a [role], I want [action], so that [benefit]" format
- Story point estimation using Fibonacci scale (1, 2, 3, 5, 8, 13)
- Jira project structure (epics → stories with labels, acceptance criteria, story points)
- Salesforce release management, sandboxes, DevOps Center, Gearset

Always produce output grounded in Salesforce best practices and Zennify's financial services focus.`

async function buildSystemPrompt(): Promise<string> {
  try {
    const standards = await prisma.standardsDocument.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    })

    if (standards.length === 0) return BASE_SYSTEM_PROMPT

    const standardsContext = standards
      .map((s) => `## ${s.title}\n${s.extractedText}`)
      .join("\n\n")

    return `${BASE_SYSTEM_PROMPT}\n\n---\n\n## ZENNIFY STANDARDS & METHODOLOGY\n\n${standardsContext}`
  } catch {
    return BASE_SYSTEM_PROMPT
  }
}

export async function aiJsonRequest<T>(
  userPrompt: string,
  toolName: string,
  toolDescription: string,
  toolSchema: Record<string, unknown>
): Promise<T> {
  const systemPrompt = await buildSystemPrompt()

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: systemPrompt,
    tools: [
      {
        name: toolName,
        description: toolDescription,
        input_schema: {
          type: "object" as const,
          ...toolSchema,
        },
      },
    ],
    tool_choice: { type: "tool", name: toolName },
    messages: [{ role: "user", content: userPrompt }],
  })

  const toolUse = response.content.find((block) => block.type === "tool_use")
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("AI did not return tool use response")
  }

  return toolUse.input as T
}

export async function aiTextRequest(userPrompt: string): Promise<string> {
  const systemPrompt = await buildSystemPrompt()

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI did not return text response")
  }

  return textBlock.text
}
