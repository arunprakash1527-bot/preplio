"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Type,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

interface Certification {
  id: string
  name: string
  code: string
}

interface UploadClientProps {
  certifications: Certification[]
  defaultCertId: string | null
}

type UploadMode = "file" | "text" | null

export function UploadClient({ certifications, defaultCertId }: UploadClientProps) {
  const [mode, setMode] = useState<UploadMode>(null)
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState("")
  const [title, setTitle] = useState("")
  const [certId, setCertId] = useState(defaultCertId ?? "")
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      selectFile(droppedFile)
    }
  }, [])

  function selectFile(f: File) {
    const validTypes = [
      "application/pdf",
    ]
    if (!validTypes.includes(f.type)) {
      toast.error("Only PDF files are supported currently")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB")
      return
    }
    setFile(f)
    setMode("file")
    if (!title) {
      // Auto-populate title from filename
      setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
    }
  }

  function resetForm() {
    setMode(null)
    setFile(null)
    setPastedText("")
    setTitle("")
    setUploading(false)
    setProcessing(false)
  }

  async function handleUpload() {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }
    if (!certId) {
      toast.error("Please select a certification")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("certificationId", certId)

      if (mode === "file" && file) {
        formData.append("type", "pdf")
        formData.append("file", file)
      } else if (mode === "text" && pastedText.trim()) {
        formData.append("type", "text")
        formData.append("pastedText", pastedText)
      } else {
        toast.error("No content to upload")
        setUploading(false)
        return
      }

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      setUploading(false)

      // If PDF, trigger processing
      if (mode === "file" && data.document?.status === "pending") {
        setProcessing(true)
        toast.info("Processing PDF...")

        const processRes = await fetch(`/api/documents/${data.document.id}/process`, {
          method: "POST",
        })

        const processData = await processRes.json()
        if (!processRes.ok) {
          toast.error(processData.error || "Processing failed")
        } else {
          toast.success(
            `Uploaded and processed — ${processData.totalChunks} chunks created`
          )
        }
        setProcessing(false)
      } else {
        toast.success("Document uploaded and processed")
      }

      resetForm()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
      setUploading(false)
      setProcessing(false)
    }
  }

  const isSubmitting = uploading || processing
  const canSubmit =
    title.trim() &&
    certId &&
    ((mode === "file" && file) || (mode === "text" && pastedText.trim()))

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      {mode !== "text" && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : file
                ? "border-primary/40 bg-primary/5"
                : "border-border hover:border-primary/30"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-10">
            {file ? (
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setFile(null)
                    setMode(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="mb-1 text-sm font-medium text-foreground">
                  Drag & drop your PDF here
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  PDF files up to 10MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) selectFile(f)
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Paste Text Option */}
      {mode !== "file" && (
        <Card
          className={`transition-colors ${
            mode === "text" ? "border-primary/40" : "hover:border-primary/30 cursor-pointer"
          }`}
          onClick={() => {
            if (mode !== "text") setMode("text")
          }}
        >
          <CardContent className="py-4">
            {mode === "text" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Paste Text</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPastedText("")
                      setMode(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste your study notes, transcripts, or any text content..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={6}
                  className="resize-y"
                />
                {pastedText && (
                  <p className="text-xs text-muted-foreground">
                    {pastedText.length.toLocaleString()} characters
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Type className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Paste Text</p>
                  <p className="text-xs text-muted-foreground">
                    Paste notes or transcripts directly
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Fields — shown after content is selected */}
      {mode && (
        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Document Title</Label>
              <Input
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., ORM Study Guide Chapter 3"
              />
            </div>

            <div className="space-y-2">
              <Label>Certification</Label>
              <Select value={certId} onValueChange={setCertId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certification" />
                </SelectTrigger>
                <SelectContent>
                  {certifications.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id}>
                      {cert.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload / Process Status */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploading ? "Uploading..." : "Processing document..."}
                </div>
                <Progress value={uploading ? 40 : 80} className="h-1.5" />
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "Uploading..." : "Processing..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Upload & Process
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
