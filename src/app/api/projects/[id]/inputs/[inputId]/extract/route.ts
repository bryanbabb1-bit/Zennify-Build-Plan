import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { extractTextFromUrl } from "@/lib/document-processor"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; inputId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { inputId } = await params
  const input = await prisma.projectInput.findUnique({ where: { id: inputId } })
  if (!input || !input.fileUrl) {
    return NextResponse.json({ error: "Input not found or has no file" }, { status: 404 })
  }

  const extractedText = await extractTextFromUrl(input.fileUrl, input.fileName || "")
  const updated = await prisma.projectInput.update({
    where: { id: inputId },
    data: { extractedText },
  })

  return NextResponse.json(updated)
}
