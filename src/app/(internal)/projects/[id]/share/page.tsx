import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import ShareManager from "@/components/share/ShareManager"

export const dynamic = "force-dynamic"

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      shareTokens: { orderBy: { createdAt: "desc" } },
      _count: { select: { outcomes: true, epics: true, stories: true } },
    },
  })

  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Client Share</h1>
        <p className="text-slate-500 mt-0.5">
          Create a read-only shareable link for your client. Control which sections are visible.
        </p>
      </div>
      <ShareManager
        projectId={id}
        tokens={project.shareTokens as unknown as Parameters<typeof ShareManager>[0]["tokens"]}
        hasContent={project._count.outcomes > 0}
      />
    </div>
  )
}
