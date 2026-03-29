import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { aiJsonRequest } from "@/lib/ai-client"
import { buildOutcomesPrompt, outcomesToolSchema, type OutcomesResult } from "@/lib/prompts/generate-outcomes"
import { buildEpicsStoriesPrompt, epicsStoriesToolSchema, type EpicsStoriesResult } from "@/lib/prompts/generate-epics-stories"
import { buildSolutionDesignPrompt, solutionDesignToolSchema } from "@/lib/prompts/generate-solution-design"
import { buildInstructionsPrompt, buildInstructionsToolSchema } from "@/lib/prompts/generate-build-instructions"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { inputs: true },
  })
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  // Create a generation job
  const job = await prisma.generationJob.create({
    data: { projectId, type: "full_analysis", status: "running", startedAt: new Date() },
  })

  // Build context string from all inputs
  const contextParts: string[] = [
    `CLIENT: ${project.clientName}`,
    `INDUSTRY SUB-VERTICAL: ${project.clientSubVertical}`,
  ]

  for (const input of project.inputs) {
    if (input.type === "digital_maturity" && input.structuredData) {
      contextParts.push(`\n## DIGITAL MATURITY ASSESSMENT\n${JSON.stringify(input.structuredData, null, 2)}`)
    }
    if (input.type === "tech_stack" && input.structuredData) {
      contextParts.push(`\n## CLIENT TECH STACK\n${JSON.stringify(input.structuredData, null, 2)}`)
    }
    if (input.type === "discovery_notes" && input.textContent) {
      contextParts.push(`\n## DISCOVERY NOTES\n${input.textContent}`)
    }
    if (input.type === "sow_pdf" && input.extractedText) {
      contextParts.push(`\n## STATEMENT OF WORK (EXTRACTED)\n${input.extractedText.slice(0, 6000)}`)
    }
    if (input.type === "hubbl_scan" && input.extractedText) {
      contextParts.push(`\n## HUBBL ORG SCAN\n${input.extractedText.slice(0, 4000)}`)
    }
  }

  const context = contextParts.join("\n")

  try {
    // Step 1: Generate Outcomes
    await prisma.generationJob.update({ where: { id: job.id }, data: { type: "outcomes" } })

    const outcomesResult = await aiJsonRequest<OutcomesResult>(
      buildOutcomesPrompt(context),
      "generate_outcomes",
      "Generate business outcomes for the Salesforce project",
      outcomesToolSchema
    )

    // Clear existing outcomes
    await prisma.outcome.deleteMany({ where: { projectId } })

    const createdOutcomes = await Promise.all(
      outcomesResult.outcomes.map((o, i) =>
        prisma.outcome.create({
          data: { projectId, ...o, sortOrder: i },
        })
      )
    )

    // Step 2: Generate Epics + Stories
    await prisma.generationJob.update({ where: { id: job.id }, data: { type: "epics_stories" } })

    const outcomesText = createdOutcomes
      .map((o, i) => `[${i}] ${o.title}: ${o.description}`)
      .join("\n")

    const epicsResult = await aiJsonRequest<EpicsStoriesResult>(
      buildEpicsStoriesPrompt(context, outcomesText),
      "generate_epics_stories",
      "Generate user epics and stories for the Salesforce project",
      epicsStoriesToolSchema
    )

    // Clear existing epics + stories
    await prisma.story.deleteMany({ where: { projectId } })
    await prisma.epic.deleteMany({ where: { projectId } })

    for (let i = 0; i < epicsResult.epics.length; i++) {
      const epicData = epicsResult.epics[i]
      const outcomeId = createdOutcomes[epicData.outcomeIndex]?.id || createdOutcomes[0]?.id

      const epic = await prisma.epic.create({
        data: {
          projectId,
          outcomeId,
          title: epicData.title,
          description: epicData.description,
          sfClouds: epicData.sfClouds,
          priority: epicData.priority,
          sortOrder: i,
        },
      })

      for (let j = 0; j < epicData.stories.length; j++) {
        const s = epicData.stories[j]
        await prisma.story.create({
          data: {
            projectId,
            epicId: epic.id,
            title: `As a ${s.userRole}, I want ${s.action}, so that ${s.benefit}`,
            userRole: s.userRole,
            action: s.action,
            benefit: s.benefit,
            acceptanceCriteria: s.acceptanceCriteria.map((c, k) => ({ id: `ac-${k}`, criterion: c })),
            type: s.type,
            priority: s.priority,
            storyPoints: s.storyPoints,
            sfObjects: s.sfObjects,
            sfFeatures: s.sfFeatures,
            sortOrder: j,
          },
        })
      }
    }

    // Step 3: Generate Solution Design
    await prisma.generationJob.update({ where: { id: job.id }, data: { type: "solution_design" } })

    const epicsText = epicsResult.epics.map((e) => `${e.title}: ${e.description}`).join("\n")

    const designResult = await aiJsonRequest<Record<string, unknown>>(
      buildSolutionDesignPrompt(context, outcomesText, epicsText),
      "generate_solution_design",
      "Generate a Salesforce solution design",
      solutionDesignToolSchema
    )

    await prisma.solutionDesign.upsert({
      where: { projectId },
      create: { projectId, ...designResult },
      update: { ...designResult },
    })

    // Step 4: Generate Build Instructions
    await prisma.generationJob.update({ where: { id: job.id }, data: { type: "build_instructions" } })

    const designText = JSON.stringify(designResult, null, 2)

    const buildResult = await aiJsonRequest<{ instructions: Array<{ title: string; phase: string; content: string; epicTitle?: string }> }>(
      buildInstructionsPrompt(context, epicsText, designText),
      "generate_build_instructions",
      "Generate step-by-step Salesforce build instructions",
      buildInstructionsToolSchema
    )

    await prisma.buildInstruction.deleteMany({ where: { projectId } })

    await Promise.all(
      buildResult.instructions.map((inst, i) =>
        prisma.buildInstruction.create({
          data: {
            projectId,
            title: inst.title,
            phase: inst.phase,
            content: inst.content,
            sortOrder: i,
          },
        })
      )
    )

    // Mark project as in-progress
    await prisma.project.update({ where: { id: projectId }, data: { status: "IN_PROGRESS" } })

    // Complete job
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: "complete", completedAt: new Date(), type: "full_analysis" },
    })

    return NextResponse.json({ success: true, jobId: job.id })
  } catch (error) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      },
    })

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    )
  }
}

// Poll job status
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const job = await prisma.generationJob.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(job)
}
