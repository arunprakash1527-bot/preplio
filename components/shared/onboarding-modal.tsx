"use client"

import { useState, useEffect } from "react"
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
import { Award, ChevronRight, ChevronLeft, GraduationCap, BookOpen } from "lucide-react"

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
  icon: React.ReactNode
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

  // Fetch certifications on mount
  useEffect(() => {
    async function fetchCertifications() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("certifications")
        .select("id, name, code, provider, description")
        .eq("is_active", true)
        .order("name")

      if (data && !error) {
        // Group by provider
        const grouped = data.reduce<Record<string, CertificationOption[]>>((acc, cert) => {
          if (!acc[cert.provider]) acc[cert.provider] = []
          acc[cert.provider].push(cert)
          return acc
        }, {})

        const groups: CertificationGroup[] = Object.entries(grouped).map(([provider, certs]) => ({
          provider,
          label: getProviderLabel(provider),
          icon: <Award className="h-6 w-6" />,
          certifications: certs,
        }))

        setCertGroups(groups)

        // If only one provider, auto-select it
        if (groups.length === 1) {
          setSelectedProvider(groups[0].provider)
          // If only one cert under that provider, auto-select it too
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
      PRMIA: "PRMIA — Professional Risk Managers' International Association",
    }
    return labels[provider] || provider
  }

  const selectedGroup = certGroups.find((g) => g.provider === selectedProvider)
  const selectedCert = selectedGroup?.certifications.find((c) => c.id === selectedCertId)
  const totalSteps = 3

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
    <Dialog open>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Choose Your Certification"}
            {step === 2 && "Select Program"}
            {step === 3 && "Study Preferences"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "What certification are you preparing for?"}
            {step === 2 && "Which program would you like to pursue?"}
            {step === 3 && "Help us personalize your learning experience."}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-primary"
                  : s < step
                    ? "w-2 bg-primary/60"
                    : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Select Certification Provider / Program */}
        {step === 1 && (
          <div className="space-y-3 pt-2">
            {loadingCerts ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading certifications...
              </div>
            ) : (
              certGroups.map((group) => (
                <button
                  key={group.provider}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(group.provider)
                    // If only one cert, auto-select and skip to step 3
                    if (group.certifications.length === 1) {
                      setSelectedCertId(group.certifications[0].id)
                      setStep(3)
                    } else {
                      setStep(2)
                    }
                  }}
                  className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 ${
                    selectedProvider === group.provider
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {group.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{group.provider}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {group.certifications.length} program
                      {group.certifications.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 2: Select Specific Certification */}
        {step === 2 && selectedGroup && (
          <div className="space-y-3 pt-2">
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
                  className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 ${
                    selectedCertId === cert.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {isDesignation ? (
                      <GraduationCap className="h-6 w-6" />
                    ) : (
                      <BookOpen className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{cert.name}</p>
                      {isDesignation && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Advanced
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cert.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Show selected certification */}
            {selectedCert && (
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{selectedCert.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCert.provider}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={() => {
                    if (selectedGroup && selectedGroup.certifications.length > 1) {
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
                  <SelectItem value="none">None — completely new</SelectItem>
                  <SelectItem value="some">Some — familiar with basics</SelectItem>
                  <SelectItem value="experienced">
                    Experienced — working in the field
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (selectedGroup && selectedGroup.certifications.length > 1) {
                    setStep(2)
                  } else {
                    setStep(1)
                  }
                }}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !selectedCertId}>
                {loading ? "Saving..." : "Get Started"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
