"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface OnboardingModalProps {
  userId: string
  fullName: string | null
}

export function OnboardingModal({ userId, fullName }: OnboardingModalProps) {
  const [name, setName] = useState(fullName ?? "")
  const [examDate, setExamDate] = useState("")
  const [hoursPerDay, setHoursPerDay] = useState("2")
  const [experience, setExperience] = useState("none")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({
        full_name: name,
        exam_date: examDate || null,
        hours_per_day: parseFloat(hoursPerDay),
        experience_level: experience,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Preplio!</DialogTitle>
          <DialogDescription>
            Let&apos;s set up your study profile to personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="onboard-name">Full Name</Label>
            <Input
              id="onboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exam-date">Target Exam Date</Label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Optional — you can set this later
            </p>
          </div>

          <div className="space-y-2">
            <Label>Hours Available Per Day</Label>
            <Select value={hoursPerDay} onValueChange={setHoursPerDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="1.5">1.5 hours</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="4">4+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prior Experience Level</Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None — completely new</SelectItem>
                <SelectItem value="some">Some — familiar with basics</SelectItem>
                <SelectItem value="experienced">Experienced — working in the field</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
