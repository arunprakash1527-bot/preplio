import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { OnboardingModal } from "@/components/shared/onboarding-modal"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const showOnboarding = profile && !profile.onboarding_completed

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <TopNav />
        <main className="mx-auto max-w-5xl px-4 py-6 pb-20 sm:px-6 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          fullName={profile.full_name}
        />
      )}
    </div>
  )
}
