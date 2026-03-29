"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, FileText, Search, FolderOpen } from "lucide-react"

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: number
  modifiedTime: string
}

interface DriveImportModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  inputType: string
  onImported: (input: { id: string; type: string; fileName?: string | null; fileUrl?: string | null; fileSize?: number | null; extractedText?: string | null; driveFileName?: string | null }) => void
}

export default function DriveImportModal({ open, onClose, projectId, inputType, onImported }: DriveImportModalProps) {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      checkConnectionAndLoad()
    }
  }, [open])

  async function checkConnectionAndLoad() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/drive/files")
      if (res.status === 401) {
        setConnected(false)
      } else if (res.ok) {
        const data = await res.json()
        setFiles(data.files || [])
        setConnected(true)
      }
    } catch {
      setError("Failed to load Drive files")
    } finally {
      setLoading(false)
    }
  }

  async function connectGoogle() {
    window.location.href = "/api/auth/google"
  }

  async function handleImport(file: DriveFile) {
    setImporting(file.id)
    setError("")
    try {
      const res = await fetch("/api/drive/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id, projectId, inputType }),
      })
      if (!res.ok) throw new Error("Import failed")
      const input = await res.json()
      onImported(input)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImporting(null)
    }
  }

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Import from Google Drive
          </DialogTitle>
        </DialogHeader>

        {!connected ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Connect Google Drive</p>
              <p className="text-sm text-slate-500 mt-0.5">Allow Zennify to browse your Drive files</p>
            </div>
            <Button onClick={connectGoogle}>Connect Google Drive</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1">
                {filtered.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No files found</p>
                ) : (
                  filtered.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-900 truncate">{file.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        disabled={importing === file.id}
                        onClick={() => handleImport(file)}
                      >
                        {importing === file.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Import"
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
