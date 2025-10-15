"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Shield, RefreshCw } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@sail.in")) {
      setError("Please enter a valid @sail.in email address")
      return
    }

    setLoading(true)
    setError("")

    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false)
      setStep("otp")
      startResendCountdown()
    }, 1500)
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError("")

    setTimeout(() => {
      setLoading(false)
      startResendCountdown()
    }, 1000)
  }

  const startResendCountdown = () => {
    setCanResend(false)
    setResendCountdown(30)

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setLoading(true)
    setError("")

    // Simulate OTP verification and role detection
    setTimeout(() => {
      setLoading(false)
      // Redirect based on email domain/role
      const role = detectUserRole(email)
      window.location.href = getDashboardUrl(role)
    }, 1500)
  }

  const detectUserRole = (email: string): string => {
    if (email.includes("operations@sail.in")) {
      // Default to planner for operations group, can be refined based on user preference
      return "planner"
    }
    if (email.includes("manager@sail.in")) return "manager"
    if (email.includes("finance-exec@sail.in")) {
      // Default to finance for finance-exec group
      return "finance"
    }
    if (email.includes("admin@sail.in")) return "admin"

    // Legacy individual role detection for backward compatibility
    if (email.includes("planner")) return "planner"
    if (email.includes("port")) return "port"
    if (email.includes("rail")) return "rail"
    if (email.includes("plant")) return "plant"
    if (email.includes("finance")) return "finance"
    if (email.includes("executive")) return "executive"

    return "planner" // default
  }

  const getDashboardUrl = (role: string): string => {
    const roleUrls = {
      planner: "/dashboard/planner",
      port: "/dashboard/port",
      rail: "/dashboard/rail",
      plant: "/dashboard/planner",
      manager: "/dashboard/manager",
      finance: "/dashboard/finance",
      executive: "/dashboard/executive",
      admin: "/dashboard/admin",
    }
    return roleUrls[role as keyof typeof roleUrls] || "/dashboard/planner"
  }

  return (
    <Card className="w-full bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-white">
          <Shield className="h-5 w-5 text-blue-400" />
          Secure Login
        </CardTitle>
        <CardDescription className="text-blue-200">
          {step === "email"
            ? "Enter your corporate email to receive an OTP"
            : "Enter the 6-digit code sent to your email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Corporate Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter corporate email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-white">
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP (6-digit numeric)"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                maxLength={6}
                required
              />
              <p className="text-xs text-blue-200 text-center">Code sent to {email}</p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-blue-200 hover:text-white hover:bg-white/10"
                  onClick={() => setStep("email")}
                >
                  Back to Email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-blue-200 hover:text-white hover:bg-white/10"
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  {canResend ? "Resend OTP" : `Resend (${resendCountdown}s)`}
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-blue-200">
          <p>
            Need help? Contact{" "}
            <a href="mailto:IT-support@sail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              IT Support
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
