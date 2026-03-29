import { notFound } from "next/navigation"
import ClientView from "@/components/share/ClientView"

interface SharedProject {
  id: string
  name: string
  clientName: string
  clientSubVertical: string
  status: string
  outcomes: unknown[]
  solutionDesign: unknown | null
  buildInstructions: unknown[]
  sectionsVisible: {
    outcomes: boolean
    epics: boolean
    stories: boolean
    design: boolean
    build: boolean
  }
}

async function getSharedProject(token: string): Promise<SharedProject | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/share/${token}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ClientSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const project = await getSharedProject(token)

  if (!project) notFound()

  return <ClientView project={project as Parameters<typeof ClientView>[0]["project"]} />
}
