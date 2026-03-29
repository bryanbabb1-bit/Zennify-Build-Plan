import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import StoryTree from "@/components/plan/StoryTree"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      outcomes: {
        orderBy: { sortOrder: "asc" },
        include: {
          epics: {
            orderBy: { sortOrder: "asc" },
            include: { stories: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  })

  if (!project) notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Project Plan</h1>
          <p className="text-slate-500 mt-0.5">
            {project.outcomes.length} outcomes · {project.outcomes.reduce((a, o) => a + o.epics.length, 0)} epics · {project.outcomes.reduce((a, o) => a + o.epics.reduce((b, e) => b + e.stories.length, 0), 0)} stories
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/api/projects/${id}/export?format=csv`}>
              <Download className="w-4 h-4 mr-1.5" />
              Jira CSV
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/api/projects/${id}/export?format=json`}>
              <Download className="w-4 h-4 mr-1.5" />
              JSON
            </Link>
          </Button>
        </div>
      </div>

      {project.outcomes.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500">No plan generated yet. Run analysis first.</p>
          <Button asChild className="mt-4">
            <Link href={`/projects/${id}/analysis`}>Go to Analysis</Link>
          </Button>
        </div>
      ) : (
        <StoryTree outcomes={project.outcomes as Parameters<typeof StoryTree>[0]["outcomes"]} />
      )}
    </div>
  )
}
