"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle } from "lucide-react"

interface Phase {
  key: string
  label: string
  href: string
}

const phases: Phase[] = [
  { key: "discovery", label: "Discovery", href: "discovery" },
  { key: "documents", label: "Documents", href: "documents" },
  { key: "analysis", label: "Analysis", href: "analysis" },
  { key: "plan", label: "Plan", href: "plan" },
  { key: "design", label: "Design", href: "design" },
  { key: "build", label: "Build", href: "build" },
  { key: "share", label: "Share", href: "share" },
]

interface PhaseNavProps {
  projectId: string
  completedPhases?: string[]
}

export default function PhaseNav({ projectId, completedPhases = [] }: PhaseNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto">
      {phases.map((phase, index) => {
        const href = `/projects/${projectId}/${phase.href}`
        const isActive = pathname.endsWith(`/${phase.href}`)
        const isCompleted = completedPhases.includes(phase.key)

        return (
          <div key={phase.key} className="flex items-center">
            {index > 0 && (
              <div className="w-4 h-px bg-slate-200 mx-0.5 shrink-0" />
            )}
            <Link
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              {phase.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
