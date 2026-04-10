import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileQuestion,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  GraduationCap,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getDaysUntil(dateStr: string | null): string | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(dateStr)
  exam.setHours(0, 0, 0, 0)
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "Exam date passed"
  if (diff === 0) return "Exam is today!"
  if (diff === 1) return "Exam tomorrow"
  return `Exam in ${diff} days`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile with certification info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, exam_date, certification_id")
    .eq("id", user!.id)
    .single()

  // Fetch certification name
  let certName: string | null = null
  let certCode: string | null = null
  if (profile?.certification_id) {
    const { data: cert } = await supabase
      .from("certifications")
      .select("name, code")
      .eq("id", profile.certification_id)
      .single()
    certName = cert?.name ?? null
    certCode = cert?.code ?? null
  }

  // Fetch real topics for this certification (will show 0% until quizzes are taken)
  let topics: { name: string; pct: number }[] = []
  if (profile?.certification_id) {
    const { data: certTopics } = await supabase
      .from("certification_topics")
      .select("name, sort_order")
      .eq("certification_id", profile.certification_id)
      .order("sort_order")

    if (certTopics) {
      // Check if user has any mastery data
      const { data: mastery } = await supabase
        .from("topic_mastery")
        .select("topic_id, mastery_percentage")
        .eq("user_id", user!.id)

      const masteryMap = new Map(
        (mastery ?? []).map((m) => [m.topic_id, m.mastery_percentage])
      )

      topics = certTopics.map((t) => ({
        name: t.name,
        pct: masteryMap.get(t.name) ?? 0,
      }))
    }
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "there"
  const examInfo = getDaysUntil(profile?.exam_date ?? null)
  const isDesignation = certCode === "ORM"
  const hasStartedStudying = topics.some((t) => t.pct > 0)

  return (
    <div className="space-y-6">
      {/* Welcome + Certification Badge */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {certName && (
            <Badge variant="secondary" className="gap-1.5 font-medium">
              {isDesignation ? (
                <GraduationCap className="h-3.5 w-3.5" />
              ) : (
                <BookOpen className="h-3.5 w-3.5" />
              )}
              {certName}
            </Badge>
          )}
          {examInfo && (
            <span className="text-sm text-muted-foreground">
              · {examInfo}
            </span>
          )}
        </div>
      </div>

      {/* Progress — shows empty state until quizzes are taken */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Study Progress</CardTitle>
            <span className="text-sm font-bold text-muted-foreground">
              {hasStartedStudying
                ? `${Math.round(topics.reduce((s, t) => s + t.pct, 0) / topics.length)}%`
                : "Not started"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={
              hasStartedStudying
                ? Math.round(topics.reduce((s, t) => s + t.pct, 0) / topics.length)
                : 0
            }
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* AI Recommendation + Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/20 bg-primary-light/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary">
              {hasStartedStudying ? "AI Recommendation" : "Get Started"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasStartedStudying ? (
              <p className="text-sm text-foreground leading-relaxed">
                Review your weakest topics and take a practice quiz to improve.
              </p>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">
                Upload your study materials to get started. The AI will generate
                practice questions and a personalized study plan.
              </p>
            )}
            <Button size="sm" className="mt-4" asChild>
              <Link href={hasStartedStudying ? "/dashboard/quiz" : "/dashboard/admin/upload"}>
                {hasStartedStudying ? "Start Session" : "Upload Materials"}
              </Link>
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

      {/* Topic Mastery — real topics from certification */}
      {topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic Mastery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topics.map((topic) => (
              <div key={topic.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{topic.name}</span>
                  <span
                    className={`font-semibold ${
                      topic.pct === 0
                        ? "text-muted-foreground"
                        : topic.pct >= 70
                          ? "text-success"
                          : topic.pct >= 50
                            ? "text-primary"
                            : "text-destructive"
                    }`}
                  >
                    {topic.pct === 0 ? "—" : `${topic.pct}%`}
                  </span>
                </div>
                <Progress value={topic.pct} className="h-1.5" />
              </div>
            ))}
            {!hasStartedStudying && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                Take your first quiz to start tracking mastery
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
