import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileQuestion, Plus } from "lucide-react"

export default function AdminQuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Manage Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Review, approve, and edit AI-generated questions
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Generate Questions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <FileQuestion className="mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No questions generated yet. Upload study materials first, then
              generate questions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
