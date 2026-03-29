import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const tokens = await prisma.shareToken.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tokens)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const body = await request.json()

  const token = await prisma.shareToken.create({
    data: {
      projectId,
      sectionsVisible: body.sectionsVisible || {
        outcomes: true,
        epics: true,
        stories: false,
        design: false,
        build: false,
      },
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  })

  return NextResponse.json(token, { status: 201 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { tokenId, ...updates } = body

  const token = await prisma.shareToken.update({
    where: { id: tokenId },
    data: updates,
  })

  return NextResponse.json(token)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tokenId = searchParams.get("tokenId")
  if (!tokenId) return NextResponse.json({ error: "tokenId required" }, { status: 400 })

  await prisma.shareToken.update({ where: { id: tokenId }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
