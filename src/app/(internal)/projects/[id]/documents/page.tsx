import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import DocumentsClient from "@/components/documents/DocumentsClient"

export const dynamic = "force-dynamic"

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { inputs: { where: { type: { in: ["sow_pdf", "hubbl_scan"] } } } },
  })

  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Documents</h1>
        <p className="text-slate-500 mt-0.5">
          Upload supporting documents. Text is automatically extracted and used in AI analysis.
        </p>
      </div>
      <DocumentsClient projectId={id} existingInputs={project.inputs} />
    </div>
  )
}
