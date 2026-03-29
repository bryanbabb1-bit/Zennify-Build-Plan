"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, CheckCircle2 } from "lucide-react"

interface DiscoveryNotesFormProps {
  projectId: string
  initialText?: string
  onSaved?: () => void
}

export default function DiscoveryNotesForm({ projectId, initialText = "", onSaved }: DiscoveryNotesFormProps) {
  const [text, setText] = useState(initialText)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    try {
      await fetch(`/api/projects/${projectId}/inputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "discovery_notes", textContent: text }),
      })
      setSaved(true)
      onSaved?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Discovery Session Notes</CardTitle>
        <CardDescription>
          Paste notes from discovery calls, workshops, or stakeholder interviews. Include pain points, goals, and key requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={`Example:\n\n- Client uses Jack Henry Symitar as core banking system\n- 12 relationship managers, each managing ~200 accounts\n- Main pain point: no visibility into full household financial picture\n- Compliance team needs audit trail on all advisor-client communications\n- Want to sunset legacy CRM (Dynamics) within 12 months\n- Priority: cross-sell referral tracking between loan and wealth divisions`}
          rows={16}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-mono text-sm"
        />
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />Saved</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save Notes</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
