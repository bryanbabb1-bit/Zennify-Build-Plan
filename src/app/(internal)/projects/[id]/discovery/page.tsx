import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import DiscoveryForms from "@/components/discovery/DiscoveryForms"

export const dynamic = "force-dynamic"

export default async function DiscoveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { inputs: true },
  })

  if (!project) notFound()

  const inputsByType = Object.fromEntries(project.inputs.map((i) => [i.type, i]))

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Discovery</h1>
        <p className="text-slate-500 mt-0.5">
          Capture client information across five input categories. Each section saves independently.
        </p>
      </div>
      <DiscoveryForms projectId={id} existingInputs={inputsByType} />
    </div>
  )
}
