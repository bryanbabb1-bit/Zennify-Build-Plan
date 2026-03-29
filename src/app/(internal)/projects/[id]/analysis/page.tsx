import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import AnalysisClient from "@/components/analysis/AnalysisClient"

export const dynamic = "force-dynamic"

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      inputs: true,
      generationJobs: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { outcomes: true, epics: true, stories: true } },
    },
  })

  if (!project) notFound()

  const inputCount = project.inputs.length
  const lastJob = project.generationJobs[0] || null

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Analysis</h1>
        <p className="text-slate-500 mt-0.5">
          Run AI analysis to generate outcomes, epics, stories, solution design, and build instructions.
        </p>
      </div>
      <AnalysisClient
        projectId={id}
        inputCount={inputCount}
        lastJob={lastJob as unknown as Parameters<typeof AnalysisClient>[0]["lastJob"]}
        outputCounts={project._count}
      />
    </div>
  )
}
