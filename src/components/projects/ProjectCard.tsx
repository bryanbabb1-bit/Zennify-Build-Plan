"use client"

import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, Calendar } from "lucide-react"
import type { ProjectStatus } from "@/types"

interface ProjectCardProps {
  id: string
  name: string
  clientName: string
  clientSubVertical: string
  status: ProjectStatus
  updatedAt: string
  _count?: { outcomes: number; epics: number; stories: number }
}

const statusConfig: Record<ProjectStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  REVIEW: { label: "Review", variant: "warning" },
  COMPLETE: { label: "Complete", variant: "success" },
}

const subVerticalColors: Record<string, string> = {
  Banking: "bg-blue-50 text-blue-700",
  Insurance: "bg-purple-50 text-purple-700",
  Wealth: "bg-green-50 text-green-700",
  Lending: "bg-orange-50 text-orange-700",
}

export default function ProjectCard({ id, name, clientName, clientSubVertical, status, updatedAt, _count }: ProjectCardProps) {
  const statusInfo = statusConfig[status]
  const subVerticalColor = subVerticalColors[clientSubVertical] || "bg-slate-50 text-slate-700"

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold text-slate-900 leading-snug">{name}</CardTitle>
          <Badge variant={statusInfo.variant} className="shrink-0">{statusInfo.label}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm text-slate-600">{clientName}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subVerticalColor}`}>
            {clientSubVertical}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        {_count && (_count.outcomes > 0 || _count.epics > 0) && (
          <div className="flex gap-3 text-xs text-slate-500">
            {_count.outcomes > 0 && (
              <span>{_count.outcomes} outcome{_count.outcomes !== 1 ? "s" : ""}</span>
            )}
            {_count.epics > 0 && (
              <span>{_count.epics} epic{_count.epics !== 1 ? "s" : ""}</span>
            )}
            {_count.stories > 0 && (
              <span>{_count.stories} stor{_count.stories !== 1 ? "ies" : "y"}</span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>Updated {formatDate(updatedAt)}</span>
        </div>
        <Button asChild size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-2">
          <Link href={`/projects/${id}/discovery`}>
            Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
