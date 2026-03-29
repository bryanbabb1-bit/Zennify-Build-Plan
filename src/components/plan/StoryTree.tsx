"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Target, GitBranch, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AcceptanceCriterion } from "@/types"

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  operational_efficiency: { label: "Operational Efficiency", color: "bg-blue-50 text-blue-700" },
  client_experience: { label: "Client Experience", color: "bg-purple-50 text-purple-700" },
  compliance: { label: "Compliance", color: "bg-red-50 text-red-700" },
  revenue_growth: { label: "Revenue Growth", color: "bg-green-50 text-green-700" },
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-slate-100 text-slate-600",
}

interface Story {
  id: string
  title: string
  userRole: string
  action: string
  benefit: string
  acceptanceCriteria: unknown
  type: string
  priority: string
  storyPoints?: number | null
  sfObjects: string[]
  sfFeatures: string[]
}

interface Epic {
  id: string
  title: string
  description: string
  sfClouds: string[]
  priority: string
  stories: Story[]
}

interface Outcome {
  id: string
  title: string
  description: string
  category: string
  priority: string
  epics: Epic[]
}

function StoryCard({ story }: { story: Story }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <button
        className="w-full text-left p-3 flex items-start gap-2.5"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-slate-900 font-medium leading-snug">{story.title}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", PRIORITY_COLORS[story.priority])}>
              {story.priority}
            </span>
            {story.storyPoints && (
              <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {story.storyPoints} pts
              </span>
            )}
            <span className="text-xs text-slate-400">{story.type}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Acceptance Criteria</p>
            <ul className="space-y-1">
              {(story.acceptanceCriteria as AcceptanceCriterion[]).map((ac, i) => (
                <li key={ac.id || i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-slate-400 shrink-0 mt-0.5">{i + 1}.</span>
                  <span>{ac.criterion}</span>
                </li>
              ))}
            </ul>
          </div>
          {story.sfObjects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-slate-400 mr-1">Objects:</span>
              {story.sfObjects.map((o) => (
                <span key={o} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{o}</span>
              ))}
            </div>
          )}
          {story.sfFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-slate-400 mr-1">Features:</span>
              {story.sfFeatures.map((f) => (
                <span key={f} className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">{f}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EpicCard({ epic }: { epic: Epic }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50">
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
          <GitBranch className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 text-sm">{epic.title}</p>
            <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", PRIORITY_COLORS[epic.priority])}>
              {epic.priority}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 leading-snug">{epic.description}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {epic.sfClouds.map((c) => (
              <span key={c} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{c}</span>
            ))}
            <span className="text-xs text-slate-400">{epic.stories.length} stories</span>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
        )}
      </button>

      {expanded && epic.stories.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {epic.stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function StoryTree({ outcomes }: { outcomes: Outcome[] }) {
  const [expandedOutcomes, setExpandedOutcomes] = useState<Set<string>>(
    new Set(outcomes.map((o) => o.id))
  )

  function toggleOutcome(id: string) {
    setExpandedOutcomes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {outcomes.map((outcome) => {
        const catInfo = CATEGORY_LABELS[outcome.category]
        const isExpanded = expandedOutcomes.has(outcome.id)

        return (
          <div key={outcome.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              className="w-full text-left p-5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
              onClick={() => toggleOutcome(outcome.id)}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-900">{outcome.title}</p>
                  {catInfo && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", catInfo.color)}>
                      {catInfo.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-snug">{outcome.description}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {outcome.epics.length} epic{outcome.epics.length !== 1 ? "s" : ""} ·{" "}
                  {outcome.epics.reduce((a, e) => a + e.stories.length, 0)} stories
                </p>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
              )}
            </button>

            {isExpanded && outcome.epics.length > 0 && (
              <div className="px-5 pb-5 space-y-3 border-t border-slate-100">
                <div className="pt-3 space-y-3">
                  {outcome.epics.map((epic) => (
                    <EpicCard key={epic.id} epic={epic} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
