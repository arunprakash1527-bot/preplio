import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileQuestion, Clock, Target, Zap } from "lucide-react"

export default function QuizPage() {
  const modes = [
    {
      title: "Practice Quiz",
      description: "10-20 questions on a specific topic, untimed",
      icon: FileQuestion,
      questions: "10-20",
    },
    {
      title: "Mock Exam — Part 1",
      description: "Full exam simulation: 60 questions, 2 hours",
      icon: Clock,
      questions: "60",
    },
    {
      title: "Mock Exam — Part 2",
      description: "Full exam simulation: 50 questions, 2 hours",
      icon: Target,
      questions: "50",
    },
    {
      title: "Quick Review",
      description: "5 questions focused on your weakest areas",
      icon: Zap,
      questions: "5",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Practice Quiz</h2>
        <p className="text-sm text-muted-foreground">
          Choose a mode to start practicing
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode) => (
          <Card
            key={mode.title}
            className="cursor-pointer transition-colors hover:border-primary/40"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <mode.icon className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{mode.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {mode.questions} questions
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {mode.description}
              </p>
              <Button size="sm" className="w-full">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
