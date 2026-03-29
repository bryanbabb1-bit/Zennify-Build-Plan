import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { outcomes: true, epics: true, stories: true } },
    },
  })

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, clientName, clientSubVertical } = body

  if (!name || !clientName) {
    return NextResponse.json({ error: "name and clientName are required" }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: { name, clientName, clientSubVertical: clientSubVertical || "Banking" },
  })

  return NextResponse.json(project, { status: 201 })
}
