import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { google } from "googleapis"
import { prisma } from "@/lib/db"

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google`
  )
}

// Initiate OAuth flow
export async function GET(request: Request) {
  const { userId } = await auth()

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    // Redirect to Google consent screen
    const oauth2Client = getOAuth2Client()
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
      ],
      prompt: "consent",
    })
    return NextResponse.redirect(url)
  }

  // Handle callback
  if (!userId) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`)

  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)

  await prisma.googleCredential.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      accessToken: tokens.access_token || "",
      refreshToken: tokens.refresh_token || "",
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
    },
    update: {
      accessToken: tokens.access_token || "",
      refreshToken: tokens.refresh_token || tokens.refresh_token || "",
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
    },
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
}
