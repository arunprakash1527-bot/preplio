"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileQuestion,
  MessageSquare,
  CalendarDays,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Quiz", href: "/dashboard/quiz", icon: FileQuestion },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Plan", href: "/dashboard/study-plan", icon: CalendarDays },
  { label: "Upload", href: "/dashboard/admin/upload", icon: Upload },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
