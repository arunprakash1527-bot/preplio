import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          P
        </div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue your study session
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Sign In</Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
