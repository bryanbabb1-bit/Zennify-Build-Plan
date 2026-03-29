import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      inputs: true,
      outcomes: { include: { epics: { include: { stories: true } } }, orderBy: { sortOrder: "asc" } },
      epics: { include: { stories: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      solutionDesign: true,
      buildInstructions: { orderBy: { sortOrder: "asc" } },
      shareTokens: { where: { isActive: true } },
      generationJobs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const project = await prisma.project.update({ where: { id }, data: body })
  return NextResponse.json(project)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
