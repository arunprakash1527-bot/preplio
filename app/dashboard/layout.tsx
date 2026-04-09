import { Sidebar } from "@/components/layout/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    </div>
  )
}
