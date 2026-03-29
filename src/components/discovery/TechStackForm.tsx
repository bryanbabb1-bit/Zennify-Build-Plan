"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, CheckCircle2 } from "lucide-react"

const SF_CLOUDS = [
  "Financial Services Cloud",
  "Sales Cloud",
  "Service Cloud",
  "Experience Cloud",
  "Marketing Cloud",
  "Revenue Cloud",
  "Data Cloud",
  "MuleSoft",
  "OmniStudio / Vlocity",
  "Einstein (AI)",
  "Tableau CRM / Analytics",
  "Slack",
  "Heroku",
]

const SF_PLATFORMS = [
  "Salesforce CPQ",
  "Field Service Lightning",
  "Nonprofit Cloud",
  "Health Cloud",
  "Pardot / Account Engagement",
]

interface TechStackFormProps {
  projectId: string
  initialData?: Record<string, unknown>
  onSaved?: () => void
}

export default function TechStackForm({ projectId, initialData, onSaved }: TechStackFormProps) {
  const [selectedClouds, setSelectedClouds] = useState<string[]>(
    (initialData?.salesforceClouds as string[]) || []
  )
  const [orgCount, setOrgCount] = useState<string>((initialData?.orgCount as string) || "1")
  const [edition, setEdition] = useState<string>((initialData?.edition as string) || "")
  const [coreSystem, setCoreSystem] = useState<string>((initialData?.coreSystem as string) || "")
  const [integrations, setIntegrations] = useState<string>((initialData?.integrations as string) || "")
  const [dataWarehouse, setDataWarehouse] = useState<string>((initialData?.dataWarehouse as string) || "")
  const [notes, setNotes] = useState<string>((initialData?.notes as string) || "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleCloud(cloud: string) {
    setSelectedClouds((prev) =>
      prev.includes(cloud) ? prev.filter((c) => c !== cloud) : [...prev, cloud]
    )
  }

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    try {
      await fetch(`/api/projects/${projectId}/inputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tech_stack",
          structuredData: {
            salesforceClouds: selectedClouds,
            orgCount,
            edition,
            coreSystem,
            integrations,
            dataWarehouse,
            notes,
          },
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
        <CardTitle className="text-base">Client Tech Stack</CardTitle>
        <CardDescription>
          Document the client&apos;s current Salesforce footprint and connected systems.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="font-medium">Salesforce Products in Use</Label>
          <div className="flex flex-wrap gap-2">
            {SF_CLOUDS.map((cloud) => (
              <button
                key={cloud}
                type="button"
                onClick={() => toggleCloud(cloud)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedClouds.includes(cloud)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {cloud}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orgCount">Number of Orgs</Label>
            <Input
              id="orgCount"
              type="number"
              min="1"
              value={orgCount}
              onChange={(e) => setOrgCount(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edition">SF Edition</Label>
            <Input
              id="edition"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="e.g. Enterprise, Unlimited"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coreSystem">Core System of Record</Label>
          <Input
            id="coreSystem"
            value={coreSystem}
            onChange={(e) => setCoreSystem(e.target.value)}
            placeholder="e.g. Jack Henry Symitar, FiServ, Salesforce"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="integrations">Current Integrations / Middleware</Label>
          <Textarea
            id="integrations"
            rows={3}
            value={integrations}
            onChange={(e) => setIntegrations(e.target.value)}
            placeholder="e.g. MuleSoft, Dell Boomi, direct REST APIs, nightly CSV feeds..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataWarehouse">Data Warehouse / Analytics Platform</Label>
          <Input
            id="dataWarehouse"
            value={dataWarehouse}
            onChange={(e) => setDataWarehouse(e.target.value)}
            placeholder="e.g. Snowflake, Tableau, Azure Synapse, none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Known technical debt, upcoming migrations, licensing constraints..."
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />Saved</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Save Tech Stack</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
