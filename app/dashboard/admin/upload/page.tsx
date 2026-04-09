import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Video, Type } from "lucide-react"

export default function AdminUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Upload Study Materials
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload PDFs, documents, or paste text for AI processing
        </p>
      </div>

      {/* Upload zone */}
      <Card className="border-2 border-dashed border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Upload className="size-6 text-primary" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-foreground">
            Drag & drop files here
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            PDF, DOCX, TXT, MD, or images
          </p>
          <Button variant="outline" size="sm">
            Browse Files
          </Button>
        </CardContent>
      </Card>

      {/* Other input methods */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="cursor-pointer transition-colors hover:border-primary/40">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Video className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">YouTube URL</p>
              <p className="text-xs text-muted-foreground">
                Extract transcript from a video
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary/40">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Type className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Paste Text</p>
              <p className="text-xs text-muted-foreground">
                Paste notes or transcripts directly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document library */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <FileText className="mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet. Upload your first study material to get
              started.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
