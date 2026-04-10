"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import {
  Award,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  BookOpen,
} from "lucide-react"

interface OnboardingModalProps {
  userId: string
  fullName: string | null
}

interface CertificationOption {
  id: string
  name: string
  code: string
  provider: string
  description: string
}

interface CertificationGroup {
  provider: string
  label: string
  certifications: CertificationOption[]
}

export function OnboardingModal({ userId, fullName }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [certGroups, setCertGroups] = useState<CertificationGroup[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null)
  const [name, setName] = useState(fullName ?? "")
  const [examDate, setExamDate] = useState("")
  const [hoursPerDay, setHoursPerDay] = useState("2")
  const [experience, setExperience] = useState("none")
  const [loading, setLoading] = useState(false)
  const [loadingCerts, setLoadingCerts] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchCertifications() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("certifications")
        .select("id, name, code, provider, description")
        .eq("is_active", true)
        .order("code")

      if (data && !error) {
        const grouped = data.reduce<Record<string, CertificationOption[]>>(
          (acc, cert) => {
            if (!acc[cert.provider]) acc[cert.provider] = []
            acc[cert.provider].push(cert)
            return acc
          },
          {}
        )

        const groups: CertificationGroup[] = Object.entries(grouped).map(
          ([provider, certs]) => ({
            provider,
            label: getProviderLabel(provider),
            certifications: certs,
          })
        )

        setCertGroups(groups)

        if (groups.length === 1) {
          setSelectedProvider(groups[0].provider)
          if (groups[0].certifications.length === 1) {
            setSelectedCertId(groups[0].certifications[0].id)
          }
        }
      }
      setLoadingCerts(false)
    }
    fetchCertifications()
  }, [])

  function getProviderLabel(provider: string): string {
    const labels: Record<string, string> = {
      PRMIA: "Professional Risk Managers' International Association",
    }
    return labels[provider] || provider
  }

  const selectedGroup = certGroups.find((g) => g.provider === selectedProvider)
  const selectedCert = selectedGroup?.certifications.find(
    (c) => c.id === selectedCertId
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCertId) return
    setLoading(true)

    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({
        full_name: name,
        exam_date: examDate || null,
        hours_per_day: parseFloat(hoursPerDay),
        experience_level: experience,
        certification_id: selectedCertId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            P
          </div>
          <span className="text-2xl font-bold text-foreground">Preplio</span>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card p-6 shadow-lg sm:p-8">
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-foreground">
              {step === 1 && "Welcome to Preplio!"}
              {step === 2 && "Choose Your Program"}
              {step === 3 && "Study Preferences"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === 1 && "Select the certification you're preparing for."}
              {step === 2 && "Which ORM program are you pursuing?"}
              {step === 3 && "Help us personalize your learning path."}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? "w-8 bg-primary"
                    : s < step
                      ? "w-3 bg-primary/50"
                      : "w-3 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Select Certification Program */}
          {step === 1 && (
            <div className="space-y-3">
              {loadingCerts ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading certifications...
                </div>
              ) : (
                certGroups.map((group) => (
                  <button
                    key={group.provider}
                    type="button"
                    onClick={() => {
                      setSelectedProvider(group.provider)
                      if (group.certifications.length === 1) {
                        setSelectedCertId(group.certifications[0].id)
                        setStep(3)
                      } else {
                        setStep(2)
                      }
                    }}
                    className="flex w-full items-center gap-4 rounded-lg border-2 border-border p-4 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {group.provider} — Operational Risk Management
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.certifications.length} program
                        {group.certifications.length !== 1 ? "s" : ""} available
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Select Certificate vs Designation */}
          {step === 2 && selectedGroup && (
            <div className="space-y-3">
              {selectedGroup.certifications.map((cert) => {
                const isDesignation = cert.code === "ORM"
                return (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() => {
                      setSelectedCertId(cert.id)
                      setStep(3)
                    }}
                    className="flex w-full items-center gap-4 rounded-lg border-2 border-border p-4 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {isDesignation ? (
                        <GraduationCap className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{cert.name}</p>
                        {isDesignation && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {isDesignation
                          ? "2 exams · 110 questions · Experience required"
                          : "1 exam · 60 questions · No experience needed"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                )
              })}

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setSelectedProvider(null)
                  setStep(1)
                }}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}

          {/* Step 3: Study Preferences */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected certification summary */}
              {selectedCert && (
                <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {selectedCert.code === "ORM" ? (
                      <GraduationCap className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedCert.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCert.provider}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => {
                      if (
                        selectedGroup &&
                        selectedGroup.certifications.length > 1
                      ) {
                        setStep(2)
                      } else {
                        setStep(1)
                      }
                    }}
                  >
                    Change
                  </Button>
                </div>
              )}

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
                <Label>Prior Risk Management Experience</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      None — completely new to risk management
                    </SelectItem>
                    <SelectItem value="some">
                      Some — familiar with basic concepts
                    </SelectItem>
                    <SelectItem value="experienced">
                      Experienced — working in risk/compliance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (
                      selectedGroup &&
                      selectedGroup.certifications.length > 1
                    ) {
                      setStep(2)
                    } else {
                      setStep(1)
                    }
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !selectedCertId}
                >
                  {loading ? "Saving..." : "Get Started"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can change your certification anytime from Settings
        </p>
      </div>
    </div>
  )
}
