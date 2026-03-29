"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

interface BuildInstruction {
  id: string
  title: string
  phase: string
  content: string
  sortOrder: number
}

const PHASES = ["setup", "config", "integration", "testing", "deploy"]

const PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  setup: { label: "Setup", color: "bg-slate-100 text-slate-700" },
  config: { label: "Configuration", color: "bg-blue-50 text-blue-700" },
  integration: { label: "Integration", color: "bg-purple-50 text-purple-700" },
  testing: { label: "Testing", color: "bg-yellow-50 text-yellow-700" },
  deploy: { label: "Deployment", color: "bg-green-50 text-green-700" },
}

function InstructionCard({ instruction }: { instruction: BuildInstruction }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
          {instruction.sortOrder + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm">{instruction.title}</p>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div className="pt-3 prose prose-sm max-w-none text-slate-700">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{instruction.content}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BuildInstructionList({ instructions }: { instructions: BuildInstruction[] }) {
  const [activePhase, setActivePhase] = useState<string | null>(null)

  const grouped = PHASES.reduce((acc, phase) => {
    const phaseInstructions = instructions.filter((i) => i.phase === phase)
    if (phaseInstructions.length > 0) acc[phase] = phaseInstructions
    return acc
  }, {} as Record<string, BuildInstruction[]>)

  const phasesToShow = activePhase
    ? { [activePhase]: grouped[activePhase] || [] }
    : grouped

  return (
    <div className="space-y-6">
      {/* Phase filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActivePhase(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm border transition-colors",
            !activePhase
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          )}
        >
          All
        </button>
        {PHASES.filter((p) => grouped[p]).map((phase) => {
          const cfg = PHASE_CONFIG[phase]
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(activePhase === phase ? null : phase)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-colors",
                activePhase === phase
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {cfg.label} ({grouped[phase].length})
            </button>
          )
        })}
      </div>

      {/* Instructions by phase */}
      {Object.entries(phasesToShow).map(([phase, phaseInstructions]) => {
        const cfg = PHASE_CONFIG[phase]
        return (
          <div key={phase}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={cn("font-medium", cfg.color)}>{cfg.label}</Badge>
              <span className="text-xs text-slate-400">{phaseInstructions.length} steps</span>
            </div>
            <div className="space-y-2">
              {phaseInstructions.map((inst) => (
                <InstructionCard key={inst.id} instruction={inst} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
