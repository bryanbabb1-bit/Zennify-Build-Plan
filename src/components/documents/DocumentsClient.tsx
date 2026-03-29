"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Loader2, CheckCircle2, ExternalLink, FolderOpen } from "lucide-react"
import DriveImportModal from "./DriveImportModal"

interface DocumentInput {
  id: string
  type: string
  fileName?: string | null
  fileUrl?: string | null
  fileSize?: number | null
  extractedText?: string | null
  driveFileName?: string | null
}

interface DocumentsClientProps {
  projectId: string
  existingInputs: DocumentInput[]
}

const DOC_TYPES = [
  {
    type: "sow_pdf",
    label: "Statement of Work / Pre-sales Docs",
    description: "Upload SOW, proposal, or pre-sales documents (PDF or DOCX)",
    accept: ".pdf,.docx,.doc",
  },
  {
    type: "hubbl_scan",
    label: "Hubbl Scan Report",
    description: "Upload Salesforce org health scan report from Hubbl",
    accept: ".pdf,.docx,.doc,.csv,.xlsx",
  },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function DocumentsClient({ projectId, existingInputs }: DocumentsClientProps) {
  const [inputs, setInputs] = useState<DocumentInput[]>(existingInputs)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [extracting, setExtracting] = useState<Record<string, boolean>>({})
  const [driveModalOpen, setDriveModalOpen] = useState(false)
  const [driveModalType, setDriveModalType] = useState<string>("")

  function getInput(type: string) {
    return inputs.find((i) => i.type === type)
  }

  async function handleFileUpload(type: string, file: File) {
    setUploading({ ...uploading, [type]: true })
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const res = await fetch(`/api/projects/${projectId}/inputs`, {
        method: "POST",
        body: formData,
      })
      const newInput = await res.json()
      setInputs((prev) => [...prev.filter((i) => i.type !== type), newInput])
    } finally {
      setUploading({ ...uploading, [type]: false })
    }
  }

  async function handleExtract(inputId: string, type: string) {
    setExtracting({ ...extracting, [inputId]: true })
    try {
      const res = await fetch(`/api/projects/${projectId}/inputs/${inputId}/extract`, { method: "POST" })
      const updated = await res.json()
      setInputs((prev) => prev.map((i) => (i.id === inputId ? updated : i)))
    } finally {
      setExtracting({ ...extracting, [inputId]: false })
    }
  }

  function openDriveModal(type: string) {
    setDriveModalType(type)
    setDriveModalOpen(true)
  }

  function handleDriveImport(newInput: DocumentInput) {
    setInputs((prev) => [...prev.filter((i) => i.type !== newInput.type), newInput])
    setDriveModalOpen(false)
  }

  return (
    <div className="space-y-4">
      {DOC_TYPES.map(({ type, label, description, accept }) => {
        const existing = getInput(type)
        const isUploading = uploading[type]
        const isExtracting = existing ? extracting[existing.id] : false

        return (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                {label}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {existing ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {existing.fileName || existing.driveFileName || "Uploaded file"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {existing.fileSize && (
                          <span className="text-xs text-slate-400">{formatBytes(existing.fileSize)}</span>
                        )}
                        {existing.extractedText ? (
                          <Badge variant="success" className="text-xs">Text extracted</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Awaiting extraction</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!existing.extractedText && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExtract(existing.id, type)}
                        disabled={isExtracting}
                      >
                        {isExtracting ? (
                          <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />Extracting</>
                        ) : (
                          "Extract Text"
                        )}
                      </Button>
                    )}
                    {existing.extractedText && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {existing.fileUrl && (
                      <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      {isUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm text-slate-600">Uploading...</span></>
                      ) : (
                        <><Upload className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-600">Click to upload or drag & drop</span></>
                      )}
                    </div>
                    <input
                      type="file"
                      accept={accept}
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(type, file)
                      }}
                    />
                  </label>
                  <Button
                    variant="outline"
                    className="shrink-0 flex items-center gap-1.5"
                    onClick={() => openDriveModal(type)}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Drive
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <DriveImportModal
        open={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        projectId={projectId}
        inputType={driveModalType}
        onImported={handleDriveImport}
      />
    </div>
  )
}
