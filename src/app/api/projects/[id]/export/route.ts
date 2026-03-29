import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { generateJiraCSV, generateJiraJSON } from "@/lib/jira-export"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get("format") || "csv"

  const epics = await prisma.epic.findMany({
    where: { projectId },
    include: { stories: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const epicsForExport = epics as any

  if (format === "json") {
    const json = generateJiraJSON(epicsForExport)
    return NextResponse.json(json)
  }

  const csv = await generateJiraCSV(epicsForExport)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="jira-import-${projectId}.csv"`,
    },
  })
}
