import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { put } from "@vercel/blob"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const inputs = await prisma.projectInput.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(inputs)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("multipart/form-data")) {
    // File upload
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file || !type) {
      return NextResponse.json({ error: "file and type are required" }, { status: 400 })
    }

    const blob = await put(`projects/${projectId}/${type}/${file.name}`, file, {
      access: "public",
    })

    const input = await prisma.projectInput.create({
      data: {
        projectId,
        type,
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
      },
    })

    return NextResponse.json(input, { status: 201 })
  } else {
    // JSON input (structured data or text)
    const body = await request.json()
    const { type, structuredData, textContent } = body

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 })
    }

    // Upsert — one input per type per project
    const existing = await prisma.projectInput.findFirst({ where: { projectId, type } })

    if (existing) {
      const input = await prisma.projectInput.update({
        where: { id: existing.id },
        data: { structuredData, textContent },
      })
      return NextResponse.json(input)
    }

    const input = await prisma.projectInput.create({
      data: { projectId, type, structuredData, textContent },
    })
    return NextResponse.json(input, { status: 201 })
  }
}
