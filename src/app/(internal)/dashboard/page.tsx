import Link from "next/link"
import { prisma } from "@/lib/db"
import ProjectCard from "@/components/projects/ProjectCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { outcomes: true, epics: true, stories: true } },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-0.5">Manage your Salesforce engagement plans</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-base font-medium text-slate-900 mb-1">No projects yet</h3>
          <p className="text-sm text-slate-500 mb-4">Create your first Salesforce project plan</p>
          <Button asChild>
            <Link href="/projects/new">Create Project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} updatedAt={project.updatedAt.toISOString()} />
          ))}
        </div>
      )}
    </div>
  )
}
