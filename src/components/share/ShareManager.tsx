"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Link2, Copy, Check, Trash2, Plus, Eye } from "lucide-react"

interface SectionsVisible {
  outcomes: boolean
  epics: boolean
  stories: boolean
  design: boolean
  build: boolean
}

interface ShareToken {
  id: string
  token: string
  isActive: boolean
  sectionsVisible: SectionsVisible | unknown
  expiresAt?: string | null
  createdAt: string
}

interface ShareManagerProps {
  projectId: string
  tokens: ShareToken[]
  hasContent: boolean
}

const SECTION_LABELS: { key: keyof SectionsVisible; label: string; description: string }[] = [
  { key: "outcomes", label: "Outcomes", description: "Business goals and objectives" },
  { key: "epics", label: "Epics", description: "Grouped bodies of work" },
  { key: "stories", label: "User Stories", description: "Individual story details" },
  { key: "design", label: "Solution Design", description: "Architecture recommendations" },
  { key: "build", label: "Build Instructions", description: "Implementation guide" },
]

export default function ShareManager({ projectId, tokens: initialTokens, hasContent }: ShareManagerProps) {
  const [tokens, setTokens] = useState<ShareToken[]>(initialTokens)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [newSections, setNewSections] = useState<SectionsVisible>({
    outcomes: true,
    epics: true,
    stories: false,
    design: false,
    build: false,
  })

  const appUrl = typeof window !== "undefined" ? window.location.origin : ""

  async function createToken() {
    setCreating(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionsVisible: newSections }),
      })
      const token = await res.json()
      setTokens((prev) => [token, ...prev])
    } finally {
      setCreating(false)
    }
  }

  async function revokeToken(tokenId: string) {
    await fetch(`/api/projects/${projectId}/share?tokenId=${tokenId}`, { method: "DELETE" })
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, isActive: false } : t)))
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${appUrl}/share/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Create new share link */}
      {hasContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Share Link</CardTitle>
            <CardDescription>Choose which sections to show your client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {SECTION_LABELS.map(({ key, label, description }) => (
                <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newSections[key]}
                    onChange={(e) => setNewSections({ ...newSections, [key]: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>
              ))}
            </div>
            <Button onClick={createToken} disabled={creating} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {creating ? "Creating..." : "Generate Share Link"}
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasContent && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500">Generate your project plan before creating a share link.</p>
          </CardContent>
        </Card>
      )}

      {/* Existing tokens */}
      {tokens.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Share Links</h3>
          {tokens.map((token) => {
            const sections = token.sectionsVisible as SectionsVisible
            const shareUrl = `${appUrl}/share/${token.token}`

            return (
              <Card key={token.id} className={!token.isActive ? "opacity-50" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-4 h-4 text-blue-500 shrink-0" />
                        <p className="text-sm font-mono text-slate-600 truncate">{shareUrl}</p>
                        {token.isActive ? (
                          <Badge variant="success" className="text-xs shrink-0">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs shrink-0">Revoked</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {SECTION_LABELS.filter(({ key }) => sections?.[key]).map(({ key, label }) => (
                          <span key={key} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {label}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">Created {formatDate(token.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {token.isActive && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyLink(token.token)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            {copied === token.token ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <a href={`/share/${token.token}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => revokeToken(token.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
