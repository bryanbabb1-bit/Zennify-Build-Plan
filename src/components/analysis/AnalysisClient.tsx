"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Play, CheckCircle2, AlertCircle, Target, GitBranch, BookOpen, Wrench } from "lucide-react"
import type { GenerationJob } from "@/types"

const STEPS = [
  { key: "outcomes", label: "Generating Outcomes", icon: Target },
  { key: "epics_stories", label: "Generating Epics & Stories", icon: GitBranch },
  { key: "solution_design", label: "Generating Solution Design", icon: BookOpen },
  { key: "build_instructions", label: "Generating Build Instructions", icon: Wrench },
]

interface AnalysisClientProps {
  projectId: string
  inputCount: number
  lastJob: GenerationJob | null
  outputCounts: { outcomes: number; epics: number; stories: number }
}

export default function AnalysisClient({ projectId, inputCount, lastJob, outputCounts }: AnalysisClientProps) {
  const router = useRouter()
  const [job, setJob] = useState<GenerationJob | null>(lastJob)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState("")

  const isRunning = job?.status === "running" || running
  const hasOutputs = outputCounts.outcomes > 0

  // Poll while running
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/analyze`)
        const latest = await res.json()
        setJob(latest)

        if (latest?.status === "complete") {
          setRunning(false)
          clearInterval(interval)
          router.refresh()
        }
        if (latest?.status === "failed") {
          setRunning(false)
          setError(latest.error || "Analysis failed")
          clearInterval(interval)
        }
      } catch {
        // continue polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isRunning, projectId, router])

  async function handleRun() {
    setRunning(true)
    setError("")
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to start analysis")
      }
    } catch (err) {
      setRunning(false)
      setError(err instanceof Error ? err.message : "Failed to start analysis")
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === job?.type)
  const progress = isRunning
    ? currentStepIndex >= 0
      ? ((currentStepIndex + 1) / STEPS.length) * 100
      : 10
    : job?.status === "complete"
    ? 100
    : 0

  return (
    <div className="space-y-4">
      {/* Input summary */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {inputCount} input source{inputCount !== 1 ? "s" : ""} ready
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {inputCount === 0
                  ? "Add discovery data and documents before running analysis"
                  : "All inputs will be analyzed together"}
              </p>
            </div>
            <Badge variant={inputCount > 0 ? "success" : "secondary"}>
              {inputCount > 0 ? "Ready" : "No inputs"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Run analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Analysis</CardTitle>
          <CardDescription>
            Claude will analyze all your inputs and generate a complete Salesforce project plan in 4 steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Steps */}
          <div className="space-y-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isDone = job?.status === "complete" || (isRunning && index < currentStepIndex)
              const isActive = isRunning && index === currentStepIndex

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? "bg-green-100" : isActive ? "bg-blue-100" : "bg-slate-100"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <span className={`text-sm ${isActive ? "text-blue-700 font-medium" : isDone ? "text-slate-600" : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {isRunning && <Progress value={progress} className="h-1.5" />}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {job?.status === "complete" && !isRunning && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-700">
                Analysis complete — {outputCounts.outcomes} outcomes, {outputCounts.epics} epics, {outputCounts.stories} stories generated
              </p>
            </div>
          )}

          <Button
            onClick={handleRun}
            disabled={isRunning || inputCount === 0}
            className="w-full"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
            ) : hasOutputs ? (
              <><Play className="w-4 h-4 mr-2" />Re-run Analysis</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Run Analysis</>
            )}
          </Button>

          {hasOutputs && !isRunning && (
            <p className="text-xs text-slate-500 text-center">
              Re-running will replace all existing outputs
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
