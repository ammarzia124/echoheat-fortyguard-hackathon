"use client"

import * as React from "react"
import Link from "next/link"
import { useSignUp, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Flame, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"

const FEATURES = [
  {
    emoji: "\uD83C\uDF21\uFE0F",
    title: "2m Hyperlocal Data",
    desc: "Street-level temperature accuracy",
  },
  {
    emoji: "\u26A1",
    title: "Autonomous Execution",
    desc: "Zero human intervention required",
  },
  {
    emoji: "\uD83D\uDEE1\uFE0F",
    title: "OSHA Compliance",
    desc: "Legally defensible audit logs",
  },
]

function computeStrength(password: string): number {
  if (password.length === 0) return 0
  if (password.length < 8) return 1
  if (!/[0-9]/.test(password)) return 2
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) return 3
  return 4
}

const STRENGTH_COLORS: Record<number, string> = {
  0: "bg-surface-3",
  1: "bg-danger",
  2: "bg-warning",
  3: "bg-info",
  4: "bg-success",
}

const STRENGTH_LABELS: Record<number, string> = {
  0: "",
  1: "Too short — needs 8+ characters",
  2: "Weak — add numbers",
  3: "Almost there — add a symbol like ! or @",
  4: "Strong password ✓",
}



export default function SignupPage() {
  const router = useRouter()
  const { signUp, isLoaded } = useSignUp()
  const { isSignedIn, isLoaded: userLoaded } = useUser()

  React.useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/dashboard")
    }
  }, [userLoaded, isSignedIn, router])

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [agreed, setAgreed] = React.useState(false)

  const strength = computeStrength(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const isFormValid =
    fullName.trim().length > 0 &&
    email.includes("@") &&
    strength >= 2 &&
    passwordsMatch &&
    agreed

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid || !isLoaded) return

    setLoading(true)
    setError(null)

    try {
      await signUp.create({
        emailAddress: email,
        password,
        username: email.split("@")[0],
        firstName: fullName.split(" ")[0] || "",
        lastName: fullName.split(" ").slice(1).join(" ") || "",
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
            "Registration failed. Please try again."
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* ── Left panel (desktop) ── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-[700px] w-[700px] -translate-x-1/4 -translate-y-1/2 rounded-full bg-accent/[0.08] blur-[120px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15">
            <Flame className="size-5 text-accent" />
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-text-primary">
            EchoHeat
          </span>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold leading-snug text-text-primary lg:text-4xl">
            Start{" "}
            <span className="text-accent">protecting your operations</span>{" "}
            today.
          </h2>

          <div className="mt-10 flex flex-col gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="mt-0.5 text-2xl">{f.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {f.title}
                  </p>
                  <p className="text-sm text-text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust line */}
        <p className="relative z-10 text-xs text-text-muted">
          Trusted by 200+ enterprises across GCC &amp; US Sunbelt
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile-only EchoHeat logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15">
              <Flame className="size-5 text-accent" />
            </span>
            <span className="font-mono text-lg font-bold tracking-tight text-text-primary">
              EchoHeat
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Get started with EchoHeat in seconds
            </p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() =>
              signUp?.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
              })
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#27272A",
              border: "1px solid rgba(63,63,70,0.6)",
              cursor: "pointer",
              color: "#FAFAFA",
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            {/* Official Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(63,63,70,0.5)" }} />
            <span style={{ fontSize: "12px", color: "#71717A" }}>or sign up with email</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(63,63,70,0.5)" }} />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-lg border border-accent-danger/40 bg-accent-danger/10 px-3 py-2.5 text-sm text-accent-danger"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-text-primary">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                placeholder="John Doe"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="
                  rounded-xl border border-border-default bg-surface-1
                  px-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                  outline-none transition-colors
                  focus:border-accent focus:ring-2 focus:ring-accent/20
                "
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-text-primary">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  rounded-xl border border-border-default bg-surface-1
                  px-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                  outline-none transition-colors
                  focus:border-accent focus:ring-2 focus:ring-accent/20
                "
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full rounded-xl border border-border-default bg-surface-1
                    px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-muted
                    outline-none transition-colors
                    focus:border-accent focus:ring-2 focus:ring-accent/20
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Strength indicator bar */}
              {password.length > 0 && (
                <div className="mt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          strength > i ? STRENGTH_COLORS[strength] : "bg-surface-3"
                        }`}
                      />
                    ))}
                  </div>
                  {STRENGTH_LABELS[strength] && (
                    <p className={`mt-1 text-[11px] ${strength === 4 ? "text-success" : "text-text-muted"}`}>
                      {STRENGTH_LABELS[strength]}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`
                  rounded-xl border bg-surface-1
                  px-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                  outline-none transition-colors
                  focus:ring-2
                  ${confirmPassword && !passwordsMatch
                    ? "border-accent-danger/40 focus:border-accent-danger focus:ring-accent-danger/20"
                    : "border-border-default focus:border-accent focus:ring-accent/20"
                  }
                `}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-[11px] text-accent-danger">Passwords do not match</p>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-accent"
              />
              <span className="text-xs text-text-muted">
                I agree to EchoHeat&apos;s{" "}
                <a href="/terms" className="text-accent hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="
                mt-2 flex w-full items-center justify-center gap-2 rounded-xl
                bg-accent px-4 py-3 text-sm font-semibold text-text-inverse
                transition-colors hover:opacity-90
                disabled:pointer-events-none disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
