import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          P
        </div>
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Start your certification prep journey
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Create Account</Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
