import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import BuildInstructionList from "@/components/build/BuildInstructionList"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { buildInstructions: { orderBy: { sortOrder: "asc" } } },
  })

  if (!project) notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Build Instructions</h1>
        <p className="text-slate-500 mt-0.5">
          Step-by-step implementation guide. Use these in Windsurf, Claude Code, or follow manually.
        </p>
      </div>

      {project.buildInstructions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500">No build instructions generated yet. Run analysis first.</p>
          <Button asChild className="mt-4">
            <Link href={`/projects/${id}/analysis`}>Go to Analysis</Link>
          </Button>
        </div>
      ) : (
        <BuildInstructionList instructions={project.buildInstructions} />
      )}
    </div>
  )
}
