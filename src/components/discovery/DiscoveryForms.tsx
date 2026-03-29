"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MaturityAssessmentForm from "./MaturityAssessmentForm"
import TechStackForm from "./TechStackForm"
import DiscoveryNotesForm from "./DiscoveryNotesForm"

interface DiscoveryFormsProps {
  projectId: string
  existingInputs: Record<string, { structuredData?: unknown; textContent?: string | null }>
}

export default function DiscoveryForms({ projectId, existingInputs }: DiscoveryFormsProps) {
  const [savedTabs, setSavedTabs] = useState<Set<string>>(
    new Set(Object.keys(existingInputs))
  )

  function markSaved(type: string) {
    setSavedTabs((prev) => new Set([...prev, type]))
  }

  return (
    <Tabs defaultValue="maturity">
      <TabsList className="mb-6 w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
        {[
          { value: "maturity", label: "Digital Maturity" },
          { value: "tech_stack", label: "Tech Stack" },
          { value: "discovery_notes", label: "Discovery Notes" },
        ].map(({ value, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm border data-[state=active]:border-slate-200 border-transparent"
          >
            {label}
            {savedTabs.has(value === "maturity" ? "digital_maturity" : value) && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="maturity">
        <MaturityAssessmentForm
          projectId={projectId}
          initialData={existingInputs["digital_maturity"]?.structuredData as Record<string, unknown> | undefined}
          onSaved={() => markSaved("digital_maturity")}
        />
      </TabsContent>

      <TabsContent value="tech_stack">
        <TechStackForm
          projectId={projectId}
          initialData={existingInputs["tech_stack"]?.structuredData as Record<string, unknown> | undefined}
          onSaved={() => markSaved("tech_stack")}
        />
      </TabsContent>

      <TabsContent value="discovery_notes">
        <DiscoveryNotesForm
          projectId={projectId}
          initialText={existingInputs["discovery_notes"]?.textContent || ""}
          onSaved={() => markSaved("discovery_notes")}
        />
      </TabsContent>
    </Tabs>
  )
}
