import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const shareToken = await prisma.shareToken.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          outcomes: {
            include: { epics: { include: { stories: true }, orderBy: { sortOrder: "asc" } } },
            orderBy: { sortOrder: "asc" },
          },
          epics: { include: { stories: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
          solutionDesign: true,
          buildInstructions: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  })

  if (!shareToken || !shareToken.isActive) {
    return NextResponse.json({ error: "Share link not found or has been deactivated" }, { status: 404 })
  }

  if (shareToken.expiresAt && new Date(shareToken.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Share link has expired" }, { status: 410 })
  }

  const sections = shareToken.sectionsVisible as {
    outcomes: boolean
    epics: boolean
    stories: boolean
    design: boolean
    build: boolean
  }

  const { project } = shareToken

  // Filter data based on visible sections
  const filteredProject = {
    id: project.id,
    name: project.name,
    clientName: project.clientName,
    clientSubVertical: project.clientSubVertical,
    status: project.status,
    outcomes: sections.outcomes ? project.outcomes.map((o) => ({
      ...o,
      epics: sections.epics ? o.epics.map((e) => ({
        ...e,
        stories: sections.stories ? e.stories : [],
      })) : [],
    })) : [],
    solutionDesign: sections.design ? project.solutionDesign : null,
    buildInstructions: sections.build ? project.buildInstructions : [],
    sectionsVisible: sections,
  }

  return NextResponse.json(filteredProject)
}
