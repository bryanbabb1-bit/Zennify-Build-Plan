import { Target, GitBranch, BookOpen, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AcceptanceCriterion } from "@/types"

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  operational_efficiency: { label: "Operational Efficiency", color: "bg-blue-50 text-blue-700" },
  client_experience: { label: "Client Experience", color: "bg-purple-50 text-purple-700" },
  compliance: { label: "Compliance", color: "bg-red-50 text-red-700" },
  revenue_growth: { label: "Revenue Growth", color: "bg-green-50 text-green-700" },
}

interface ClientViewProject {
  name: string
  clientName: string
  clientSubVertical: string
  outcomes: Array<{
    id: string
    title: string
    description: string
    category: string
    priority: string
    epics: Array<{
      id: string
      title: string
      description: string
      sfClouds: string[]
      stories: Array<{
        id: string
        title: string
        acceptanceCriteria: AcceptanceCriterion[]
        storyPoints?: number | null
        priority: string
      }>
    }>
  }>
  solutionDesign: {
    recommendedClouds?: Array<{ cloud: string; tier: string; rationale: string }> | null
    narrativeSummary?: string | null
  } | null
  buildInstructions: Array<{ id: string; title: string; phase: string }>
  sectionsVisible: {
    outcomes: boolean
    epics: boolean
    stories: boolean
    design: boolean
    build: boolean
  }
}

export default function ClientView({ project }: { project: ClientViewProject }) {
  const { sectionsVisible } = project

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">Zennify</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{project.name}</p>
            <p className="text-xs text-slate-500">{project.clientName} · {project.clientSubVertical}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Hero */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-slate-500 mt-2">Salesforce Implementation Plan · Prepared by Zennify</p>
        </div>

        {/* Outcomes */}
        {sectionsVisible.outcomes && project.outcomes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Business Outcomes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.outcomes.map((outcome) => {
                const catInfo = CATEGORY_LABELS[outcome.category]
                return (
                  <div key={outcome.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    {catInfo && (
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium mb-3 inline-block", catInfo.color)}>
                        {catInfo.label}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 mt-1">{outcome.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{outcome.description}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Epics */}
        {sectionsVisible.epics && project.outcomes.some((o) => o.epics.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-900">Project Epics</h2>
            </div>
            <div className="space-y-4">
              {project.outcomes.map((outcome) =>
                outcome.epics.map((epic) => (
                  <div key={epic.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{epic.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{epic.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {epic.sfClouds.map((c) => (
                            <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{c}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded shrink-0">
                        {epic.stories.length} stories
                      </span>
                    </div>

                    {sectionsVisible.stories && epic.stories.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                        {epic.stories.map((story) => (
                          <div key={story.id} className="flex items-start gap-3 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                            <div>
                              <p className="text-slate-700">{story.title}</p>
                              {story.storyPoints && (
                                <span className="text-xs text-slate-400">{story.storyPoints} pts</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Solution Design */}
        {sectionsVisible.design && project.solutionDesign && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Solution Design</h2>
            </div>
            <div className="space-y-4">
              {project.solutionDesign.narrativeSummary && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {project.solutionDesign.narrativeSummary}
                  </p>
                </div>
              )}
              {project.solutionDesign.recommendedClouds && project.solutionDesign.recommendedClouds.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-3">Recommended Salesforce Products</h3>
                  <div className="space-y-2">
                    {project.solutionDesign.recommendedClouds.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-slate-900">{rec.cloud}</p>
                          {rec.tier && <span className="text-xs text-blue-600">{rec.tier}</span>}
                          <p className="text-xs text-slate-500 mt-0.5">{rec.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Build Instructions summary */}
        {sectionsVisible.build && project.buildInstructions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Implementation Overview</h2>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="space-y-1">
                {project.buildInstructions.map((inst, i) => (
                  <div key={inst.id} className="flex items-center gap-3 py-1.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700">{inst.title}</span>
                    <span className="text-xs text-slate-400 ml-auto">{inst.phase}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-6 pb-8 border-t border-slate-200">
          <p className="text-sm text-slate-400">
            Prepared by Zennify · Salesforce Financial Services Consultants
          </p>
        </footer>
      </main>
    </div>
  )
}
