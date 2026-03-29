import { prisma } from "@/lib/db"
import StandardsAdmin from "@/components/admin/StandardsAdmin"

export const dynamic = "force-dynamic"

export default async function StandardsPage() {
  const standards = await prisma.standardsDocument.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Standards Documents</h1>
        <p className="text-slate-500 mt-0.5">
          Manage internal standards and methodology documents. Active documents are automatically injected into every AI prompt.
        </p>
      </div>
      <StandardsAdmin standards={standards as unknown as Parameters<typeof StandardsAdmin>[0]["standards"]} />
    </div>
  )
}
