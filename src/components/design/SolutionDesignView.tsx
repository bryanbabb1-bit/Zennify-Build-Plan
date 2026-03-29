import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, ArrowLeftRight, Database, Shield } from "lucide-react"

interface CloudRecommendation {
  cloud: string
  tier: string
  rationale: string
}

interface Integration {
  system: string
  pattern: string
  direction: string
  notes: string
}

interface CustomObject {
  object: string
  purpose: string
  keyFields: string[]
}

interface SolutionDesignData {
  recommendedClouds?: CloudRecommendation[] | null
  integrations?: Integration[] | null
  customObjects?: CustomObject[] | null
  dataArchitecture?: Record<string, string> | null
  securityModel?: Record<string, unknown> | null
  narrativeSummary?: string | null
}

export default function SolutionDesignView({ design }: { design: SolutionDesignData }) {
  return (
    <div className="space-y-6">
      {design.narrativeSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {design.narrativeSummary as string}
            </p>
          </CardContent>
        </Card>
      )}

      {design.recommendedClouds && (design.recommendedClouds as CloudRecommendation[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-500" />
              Recommended Salesforce Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(design.recommendedClouds as CloudRecommendation[]).map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-slate-900">{rec.cloud}</p>
                      {rec.tier && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{rec.tier}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{rec.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {design.integrations && (design.integrations as Integration[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-purple-500" />
              Integration Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-semibold text-slate-600 pr-4">System</th>
                    <th className="pb-2 font-semibold text-slate-600 pr-4">Pattern</th>
                    <th className="pb-2 font-semibold text-slate-600 pr-4">Direction</th>
                    <th className="pb-2 font-semibold text-slate-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(design.integrations as Integration[]).map((int, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{int.system}</td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{int.pattern}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600 whitespace-nowrap">{int.direction}</td>
                      <td className="py-2.5 text-slate-500">{int.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {design.customObjects && (design.customObjects as CustomObject[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-green-500" />
              Custom Objects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(design.customObjects as CustomObject[]).map((obj, i) => (
                <div key={i} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-sm font-semibold text-blue-700">{obj.object}</p>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{obj.purpose}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {obj.keyFields.map((f) => (
                      <span key={f} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {design.securityModel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Security Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(design.securityModel as Record<string, unknown>).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  {Array.isArray(value) ? (
                    <ul className="space-y-0.5">
                      {value.map((v, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                          <span className="text-slate-300 mt-1">•</span> {v}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-700">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
