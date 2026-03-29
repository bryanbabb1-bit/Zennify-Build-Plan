import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { google } from "googleapis"
import { prisma } from "@/lib/db"
import { put } from "@vercel/blob"
import { extractTextFromBuffer } from "@/lib/document-processor"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { fileId, projectId, inputType } = await request.json()

  const cred = await prisma.googleCredential.findUnique({ where: { clerkUserId: userId } })
  if (!cred) return NextResponse.json({ error: "Google Drive not connected" }, { status: 401 })

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  oauth2Client.setCredentials({
    access_token: cred.accessToken,
    refresh_token: cred.refreshToken,
  })

  const drive = google.drive({ version: "v3", auth: oauth2Client })

  // Get file metadata
  const meta = await drive.files.get({ fileId, fields: "id,name,mimeType,size" })
  const fileName = meta.data.name || "imported-file"
  const mimeType = meta.data.mimeType || ""

  // Download file content
  let buffer: Buffer
  let downloadFileName = fileName

  if (mimeType === "application/vnd.google-apps.document") {
    // Export Google Doc as DOCX
    const res = await drive.files.export(
      { fileId, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      { responseType: "arraybuffer" }
    )
    buffer = Buffer.from(res.data as ArrayBuffer)
    downloadFileName = `${fileName}.docx`
  } else {
    const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" })
    buffer = Buffer.from(res.data as ArrayBuffer)
  }

  // Extract text
  const extractedText = await extractTextFromBuffer(buffer, downloadFileName)

  // Store in Vercel Blob
  const blob = await put(`projects/${projectId}/${inputType}/${downloadFileName}`, buffer, {
    access: "public",
    contentType: mimeType,
  })

  // Upsert input record
  const existing = await prisma.projectInput.findFirst({ where: { projectId, type: inputType } })

  const data = {
    type: inputType,
    fileUrl: blob.url,
    fileName: downloadFileName,
    fileSize: buffer.length,
    extractedText,
    driveFileId: fileId,
    driveFileName: fileName,
  }

  let input
  if (existing) {
    input = await prisma.projectInput.update({ where: { id: existing.id }, data })
  } else {
    input = await prisma.projectInput.create({ data: { projectId, ...data } })
  }

  return NextResponse.json(input)
}
