import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  FileQuestion,
  MessageSquare,
  CalendarDays,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Good morning, User
        </h2>
        <p className="text-sm text-muted-foreground">
          ORM Designation — Part 1 · Exam in 34 days
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Study Progress</CardTitle>
            <span className="text-sm font-bold text-primary">68%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={68} className="h-2" />
        </CardContent>
      </Card>

      {/* AI Recommendation + Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/20 bg-primary-light/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary">
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              Focus on <strong>Risk Governance Frameworks</strong> today. Your
              accuracy dropped to 58% in this area.
            </p>
            <Button size="sm" className="mt-4">
              Start Session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Practice Quiz", href: "/dashboard/quiz", icon: FileQuestion },
              { label: "Ask AI Tutor", href: "/dashboard/chat", icon: MessageSquare },
              { label: "Study Plan", href: "/dashboard/study-plan", icon: CalendarDays },
              { label: "Review Weak Areas", href: "/dashboard/quiz", icon: TrendingUp },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                <action.icon className="size-4 text-primary" />
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Topic Mastery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topic Mastery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "IT & Cyber Risk", pct: 82 },
            { name: "Risk Governance", pct: 58 },
            { name: "Compliance & Regulatory", pct: 71 },
            { name: "Supply Chain Risk", pct: 45 },
            { name: "Business Continuity", pct: 63 },
            { name: "Financial Crime & Fraud", pct: 70 },
          ].map((topic) => (
            <div key={topic.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{topic.name}</span>
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
