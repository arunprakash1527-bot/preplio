"use client"

import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/quiz": "Practice Quiz",
  "/dashboard/chat": "AI Study Assistant",
  "/dashboard/study-plan": "Study Plan",
  "/dashboard/admin/upload": "Upload Materials",
  "/dashboard/admin/questions": "Manage Questions",
}

export function TopNav() {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? "Dashboard"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9"
            readOnly
          />
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  )
}
