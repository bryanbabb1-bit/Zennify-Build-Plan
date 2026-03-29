import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import SolutionDesignView from "@/components/design/SolutionDesignView"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { solutionDesign: true },
  })

  if (!project) notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Solution Design</h1>
        <p className="text-slate-500 mt-0.5">Salesforce architecture recommendations for this engagement</p>
      </div>

      {!project.solutionDesign ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500">No solution design generated yet. Run analysis first.</p>
          <Button asChild className="mt-4">
            <Link href={`/projects/${id}/analysis`}>Go to Analysis</Link>
          </Button>
        </div>
      ) : (
        <SolutionDesignView design={project.solutionDesign as Parameters<typeof SolutionDesignView>[0]["design"]} />
      )}
    </div>
  )
}
