"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Upload, ToggleLeft, ToggleRight, FileText, Loader2 } from "lucide-react"

interface StandardsDocument {
  id: string
  title: string
  category: string
  isActive: boolean
  version: number
  fileUrl?: string | null
  createdAt: string
  updatedAt: string
}

interface StandardsAdminProps {
  standards: StandardsDocument[]
}

const CATEGORIES = [
  { value: "story_format", label: "Story Format" },
  { value: "naming", label: "Naming Conventions" },
  { value: "delivery", label: "Delivery Methodology" },
  { value: "architecture", label: "Architecture Standards" },
  { value: "financial_services", label: "Financial Services" },
]

export default function StandardsAdmin({ standards: initialStandards }: StandardsAdminProps) {
  const [standards, setStandards] = useState<StandardsDocument[]>(initialStandards)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formMode, setFormMode] = useState<"file" | "text">("file")
  const [form, setForm] = useState({
    title: "",
    category: "story_format",
    textContent: "",
  })
  const [file, setFile] = useState<File | null>(null)

  async function handleSubmit() {
    if (!form.title || !form.category) return
    setUploading(true)

    try {
      let res: Response

      if (formMode === "file" && file) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("title", form.title)
        formData.append("category", form.category)
        res = await fetch("/api/admin/standards", { method: "POST", body: formData })
      } else {
        res = await fetch("/api/admin/standards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form }),
        })
      }

      const doc = await res.json()
      setStandards((prev) => [doc, ...prev])
      setShowForm(false)
      setForm({ title: "", category: "story_format", textContent: "" })
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    await fetch("/api/admin/standards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentActive }),
    })
    setStandards((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !currentActive } : s))
    )
  }

  async function deleteDoc(id: string) {
    if (!confirm("Delete this standards document?")) return
    await fetch(`/api/admin/standards?id=${id}`, { method: "DELETE" })
    setStandards((prev) => prev.filter((s) => s.id !== id))
  }

  const activeCount = standards.filter((s) => s.isActive).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {activeCount} active document{activeCount !== 1 ? "s" : ""} injected into AI prompts
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {standards.length} total documents
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Standards Document</CardTitle>
            <CardDescription>
              Upload a PDF/DOCX or paste text directly. The content will be extracted and injected into AI prompts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={formMode === "file" ? "default" : "outline"}
                onClick={() => setFormMode("file")}
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                Upload File
              </Button>
              <Button
                size="sm"
                variant={formMode === "text" ? "default" : "outline"}
                onClick={() => setFormMode("text")}
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                Paste Text
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Story Writing Standards"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formMode === "file" ? (
              <div className="space-y-2">
                <Label>File (PDF or DOCX)</Label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Paste your standards document content here..."
                  rows={10}
                  value={form.textContent}
                  onChange={(e) => setForm({ ...form, textContent: e.target.value })}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
                {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : "Save Document"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document list */}
      <div className="space-y-3">
        {CATEGORIES.map(({ value: cat, label: catLabel }) => {
          const catDocs = standards.filter((s) => s.category === cat)
          if (catDocs.length === 0) return null

          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{catLabel}</h3>
              <div className="space-y-2">
                {catDocs.map((doc) => (
                  <Card key={doc.id} className={!doc.isActive ? "opacity-60" : ""}>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                            <p className="text-xs text-slate-400">v{doc.version}</p>
                          </div>
                          <Badge variant={doc.isActive ? "success" : "secondary"} className="text-xs shrink-0">
                            {doc.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActive(doc.id, doc.isActive)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {doc.isActive ? (
                              <ToggleRight className="w-5 h-5 text-blue-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteDoc(doc.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}

        {standards.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500 text-sm">No standards documents yet</p>
            <p className="text-slate-400 text-xs mt-1">Add your first document to shape how AI generates outputs</p>
          </div>
        )}
      </div>
    </div>
  )
}
