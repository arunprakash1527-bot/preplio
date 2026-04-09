import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Preplio - AI Certification Coach",
    template: "%s | Preplio",
  },
  description:
    "Master your certification exams with AI-powered practice questions, adaptive study plans, and an intelligent tutor.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
