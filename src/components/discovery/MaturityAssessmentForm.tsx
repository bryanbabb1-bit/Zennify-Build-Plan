"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, CheckCircle2 } from "lucide-react"

const MATURITY_CATEGORIES = [
  { id: "crm_adoption", name: "CRM Adoption & Data Quality" },
  { id: "digital_channels", name: "Digital Channels (Web/Mobile/Portal)" },
  { id: "process_automation", name: "Process Automation & Workflows" },
  { id: "data_analytics", name: "Data & Analytics Capabilities" },
  { id: "integration", name: "System Integration & API Maturity" },
  { id: "compliance_risk", name: "Compliance & Risk Management" },
  { id: "client_experience", name: "Client Experience & Self-Service" },
  { id: "advisor_productivity", name: "Advisor / Staff Productivity" },
]

interface MaturityAssessmentFormProps {
  projectId: string
  initialData?: Record<string, unknown>
  onSaved?: () => void
}

export default function MaturityAssessmentForm({ projectId, initialData, onSaved }: MaturityAssessmentFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    (initialData?.scores as Record<string, number>) || {}
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    (initialData?.notes as Record<string, string>) || {}
  )
  const [overallNotes, setOverallNotes] = useState<string>((initialData?.overallNotes as string) || "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    try {
      await fetch(`/api/projects/${projectId}/inputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "digital_maturity",
          structuredData: { scores, notes, overallNotes },
        }),
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
        <CardTitle className="text-base">Digital Maturity Assessment</CardTitle>
        <CardDescription>
          Score the client&apos;s current capabilities from 1 (minimal) to 5 (best-in-class). Add notes for context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {MATURITY_CATEGORIES.map((cat) => (
          <div key={cat.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-sm">{cat.name}</Label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScores({ ...scores, [cat.id]: n })}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors border ${
                      scores[cat.id] === n
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Notes on current state..."
              rows={2}
              className="text-sm"
              value={notes[cat.id] || ""}
              onChange={(e) => setNotes({ ...notes, [cat.id]: e.target.value })}
            />
          </div>
        ))}

        <div className="space-y-2 pt-2 border-t">
          <Label>Overall Assessment Notes</Label>
          <Textarea
            placeholder="Key observations, gaps, client priorities..."
            rows={4}
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />Saved</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save Assessment</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
