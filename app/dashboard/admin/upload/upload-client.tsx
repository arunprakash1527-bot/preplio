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
import {
  Upload,
  FileText,
  Type,
  X,
  Loader2,
  CheckCircle2,
  Video,
  Image as ImageIcon,
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

type UploadMode = "file" | "text" | "youtube" | "image" | null

export function UploadClient({ certifications, defaultCertId }: UploadClientProps) {
  const [mode, setMode] = useState<UploadMode>(null)
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [title, setTitle] = useState("")
  const [certId, setCertId] = useState(defaultCertId ?? "")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (droppedFile.type.startsWith("image/")) {
        selectImage(droppedFile)
      } else {
        selectFile(droppedFile)
      }
    }
  }, [])

  function selectFile(f: File) {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are supported for document upload")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB")
      return
    }
    setFile(f)
    setMode("file")
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
  }

  function selectImage(f: File) {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(f.type)) {
      toast.error("Supported: JPEG, PNG, GIF, WebP")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB")
      return
    }
    setFile(f)
    setMode("image")
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
  }

  function resetForm() {
    setMode(null)
    setFile(null)
    setPastedText("")
    setYoutubeUrl("")
    setTitle("")
    setUploading(false)
  }

  async function handleUpload() {
    if (!title.trim()) { toast.error("Please enter a title"); return }
    if (!certId) { toast.error("Please select a certification"); return }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("certificationId", certId)

      if (mode === "file" && file) {
        formData.append("type", "pdf")
        formData.append("file", file)
      } else if (mode === "image" && file) {
        formData.append("type", "image")
        formData.append("file", file)
      } else if (mode === "text" && pastedText.trim()) {
        formData.append("type", "text")
        formData.append("pastedText", pastedText)
      } else if (mode === "youtube" && youtubeUrl.trim()) {
        formData.append("type", "youtube")
        formData.append("youtubeUrl", youtubeUrl.trim())
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

      // PDF needs separate processing step
      if (mode === "file" && data.document?.status === "pending") {
        toast.info("Processing PDF...")
        const processRes = await fetch(`/api/documents/${data.document.id}/process`, {
          method: "POST",
        })
        const processData = await processRes.json()
        if (!processRes.ok) {
          toast.error(processData.error || "Processing failed")
        } else {
          toast.success(`Done — ${processData.totalChunks} chunks created`)
        }
      } else if (data.document?.status === "completed") {
        toast.success("Uploaded and processed successfully")
      } else {
        toast.error(data.error || "Something went wrong")
      }

      resetForm()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const canSubmit =
    title.trim() &&
    certId &&
    !uploading &&
    ((mode === "file" && file) ||
      (mode === "image" && file) ||
      (mode === "text" && pastedText.trim()) ||
      (mode === "youtube" && youtubeUrl.trim()))

  // If a mode is selected, show that input; otherwise show all options
  if (mode) {
    return (
      <div className="space-y-4">
        {/* Active input */}
        <Card className="border-primary/40">
          <CardContent className="py-4">
            {/* File / Image selected */}
            {(mode === "file" || mode === "image") && file && (
              <div className="flex items-center gap-3">
                {mode === "image" ? (
                  <ImageIcon className="h-8 w-8 text-primary" />
                ) : (
                  <FileText className="h-8 w-8 text-primary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                    {mode === "image" && " · OCR via Claude Vision"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* YouTube URL input */}
            {mode === "youtube" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-500" />
                    YouTube URL
                  </Label>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Transcript will be extracted automatically from captions
                </p>
              </div>
            )}

            {/* Paste text input */}
            {mode === "text" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Paste Transcript / Notes</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste your video transcript, study notes, or any text content..."
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
            )}
          </CardContent>
        </Card>

        {/* Form fields */}
        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Title</Label>
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

            <Button className="w-full" onClick={handleUpload} disabled={!canSubmit}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "youtube"
                    ? "Fetching transcript..."
                    : mode === "image"
                      ? "Running OCR..."
                      : "Processing..."}
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
      </div>
    )
  }

  // No mode selected — show all input options
  return (
    <div className="grid gap-3 sm:grid-cols-2"
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Card
        className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm"
        onClick={() => setMode("youtube")}
      >
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <Video className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-medium text-foreground">YouTube Video</p>
            <p className="text-xs text-muted-foreground">Extract transcript from captions</p>
          </div>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm"
        onClick={() => setMode("text")}
      >
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Type className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Paste Transcript</p>
            <p className="text-xs text-muted-foreground">Paste notes or video transcripts</p>
          </div>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm"
        onClick={() => imageInputRef.current?.click()}
      >
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <ImageIcon className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="font-medium text-foreground">Image (OCR)</p>
            <p className="text-xs text-muted-foreground">Extract text from photos & screenshots</p>
          </div>
        </CardContent>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) selectImage(f)
          }}
        />
      </Card>

      <Card
        className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">PDF Document</p>
            <p className="text-xs text-muted-foreground">Upload study guides & textbooks</p>
          </div>
        </CardContent>
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
      </Card>
    </div>
  )
}
