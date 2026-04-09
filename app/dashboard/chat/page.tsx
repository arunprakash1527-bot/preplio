import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles } from "lucide-react"

const suggestedQuestions = [
  "What are Key Risk Indicators (KRIs) vs KPIs?",
  "Explain the Three Lines of Defense model",
  "How does Basel II relate to operational risk?",
  "What is the difference between inherent and residual risk?",
]

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          AI Study Assistant
        </h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about any ORM topic
        </p>
      </div>

      {/* Chat area */}
      <div className="mt-4 flex flex-1 flex-col rounded-xl border border-border bg-card">
        {/* Empty state */}
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="size-6 text-primary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Start a conversation
          </h3>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Ask about any ORM topic and get answers with source citations
          </p>

          <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
            {suggestedQuestions.map((q) => (
              <Card
                key={q}
                className="cursor-pointer p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {q}
              </Card>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about any ORM topic..."
              className="flex-1"
              readOnly
            />
            <Button size="icon">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
