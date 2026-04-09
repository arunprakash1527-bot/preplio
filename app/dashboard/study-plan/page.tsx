import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, RefreshCw } from "lucide-react"

export default function StudyPlanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Study Plan</h2>
          <p className="text-sm text-muted-foreground">
            Your personalized study schedule
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="size-4" />
          Regenerate Plan
        </Button>
      </div>

      {/* Exam countdown */}
      <Card className="border-primary/20 bg-primary-light/30">
        <CardContent className="flex items-center gap-6 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-card">
            <span className="text-xl font-bold text-primary">34</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Days until your exam
            </p>
            <p className="text-sm text-muted-foreground">
              Predicted readiness: 68%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Focus */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4 text-primary" />
            Today&apos;s Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold text-foreground">
            Risk Governance Frameworks
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Study new material · 2 hours · Read chapters 1-3 of ORM Handbook
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm">Start Session</Button>
            <Button size="sm" variant="outline">
              Mark Complete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topic Mastery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topic Mastery Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Risk Governance & Frameworks", pct: 58, weight: "20%" },
            { name: "IT Risk & Cybersecurity", pct: 82, weight: "15%" },
            { name: "Risk Assessment & Measurement", pct: 63, weight: "15%" },
            { name: "Compliance & Regulatory", pct: 71, weight: "15%" },
            { name: "Business Continuity", pct: 55, weight: "10%" },
            { name: "Supply Chain & Third-Party", pct: 45, weight: "10%" },
            { name: "Financial Crime & Fraud", pct: 70, weight: "10%" },
            { name: "Capital Modeling & Reporting", pct: 40, weight: "5%" },
          ].map((topic) => (
            <div key={topic.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {topic.name}{" "}
                  <span className="text-xs">({topic.weight})</span>
                </span>
                <span
                  className={`font-semibold ${
                    topic.pct >= 70
                      ? "text-success"
                      : topic.pct >= 50
                        ? "text-primary"
                        : "text-destructive"
                  }`}
                >
                  {topic.pct}%
                </span>
              </div>
              <Progress value={topic.pct} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
