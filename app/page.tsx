import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileQuestion, MessageSquare, CalendarDays, ArrowRight } from "lucide-react"

const features = [
  {
    icon: FileQuestion,
    title: "AI Practice Questions",
    description:
      "Exam-realistic multiple choice questions generated from your study materials. Adaptive difficulty that matches your level.",
  },
  {
    icon: CalendarDays,
    title: "Smart Study Plans",
    description:
      "AI-generated study schedules that adapt based on your performance. Spaced repetition ensures you retain what you learn.",
  },
  {
    icon: MessageSquare,
    title: "AI Tutor Chat",
    description:
      "Ask questions and get instant answers with source citations from your study materials. Like having a tutor available 24/7.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              P
            </div>
            <span className="text-lg font-bold text-foreground">Preplio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Master Your Certification
          <br />
          <span className="text-primary">with AI</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          AI-powered practice exams, adaptive study plans, and an intelligent
          tutor — all built from your study materials.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-left">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Preplio. AI-powered certification
            coaching.
          </p>
        </div>
      </footer>
    </div>
  )
}
