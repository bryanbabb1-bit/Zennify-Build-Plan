import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import PhaseNav from "@/components/projects/PhaseNav"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: { select: { inputs: true, outcomes: true, epics: true } },
    },
  })

  if (!project) notFound()

  // Determine completed phases
  const completedPhases: string[] = []
  if (project._count.inputs > 0) completedPhases.push("discovery", "documents")
  if (project._count.outcomes > 0) completedPhases.push("analysis")
  if (project._count.epics > 0) completedPhases.push("plan")

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)]">
      {/* Project header */}
      <div className="border-b bg-white px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2.5">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-semibold text-slate-900 truncate">{project.name}</h2>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500 truncate">{project.clientName}</span>
              <Badge variant="secondary" className="text-xs shrink-0">{project.clientSubVertical}</Badge>
            </div>
          </div>
          <PhaseNav projectId={id} completedPhases={completedPhases} />
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 bg-slate-50">
        {children}
      </div>
    </div>
  )
}
