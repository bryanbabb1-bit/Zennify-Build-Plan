import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { google } from "googleapis"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cred = await prisma.googleCredential.findUnique({ where: { clerkUserId: userId } })
  if (!cred) return NextResponse.json({ error: "Google Drive not connected" }, { status: 401 })

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: cred.accessToken,
    refresh_token: cred.refreshToken,
    expiry_date: cred.expiresAt.getTime(),
  })

  // Auto-refresh if expired
  if (new Date() > cred.expiresAt) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    await prisma.googleCredential.update({
      where: { clerkUserId: userId },
      data: {
        accessToken: credentials.access_token || cred.accessToken,
        expiresAt: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
      },
    })
    oauth2Client.setCredentials(credentials)
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""

  const drive = google.drive({ version: "v3", auth: oauth2Client })

  const fileQuery = [
    "mimeType != 'application/vnd.google-apps.folder'",
    "(mimeType = 'application/pdf' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'application/vnd.ms-excel' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')",
    "trashed = false",
  ]

  if (query) {
    fileQuery.push(`name contains '${query.replace(/'/g, "\\'")}'`)
  }

  const res = await drive.files.list({
    q: fileQuery.join(" and "),
    fields: "files(id, name, mimeType, size, modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: 50,
  })

  return NextResponse.json({ files: res.data.files || [] })
}
