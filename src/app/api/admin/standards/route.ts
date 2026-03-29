import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { put } from "@vercel/blob"
import { extractTextFromBuffer } from "@/lib/document-processor"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const standards = await prisma.standardsDocument.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  })

  return NextResponse.json(standards)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const category = formData.get("category") as string

    if (!file || !title || !category) {
      return NextResponse.json({ error: "file, title, and category are required" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const extractedText = await extractTextFromBuffer(buffer, file.name)

    const blob = await put(`standards/${file.name}`, file, { access: "public" })

    const doc = await prisma.standardsDocument.create({
      data: { title, category, extractedText, fileUrl: blob.url },
    })

    return NextResponse.json(doc, { status: 201 })
  } else {
    const body = await request.json()
    const { title, category, textContent } = body

    if (!title || !category || !textContent) {
      return NextResponse.json({ error: "title, category, and textContent are required" }, { status: 400 })
    }

    const doc = await prisma.standardsDocument.create({
      data: { title, category, extractedText: textContent },
    })

    return NextResponse.json(doc, { status: 201 })
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  const doc = await prisma.standardsDocument.update({
    where: { id },
    data: { ...updates, version: { increment: 1 } },
  })

  return NextResponse.json(doc)
}

export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await prisma.standardsDocument.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
