"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useSignIn } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Flame, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackError = searchParams.get("error")
  const verified = searchParams.get("verified") === "true"
  const { signIn, isLoaded } = useSignIn()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(callbackError)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError(null)

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })
      if (result.status === "complete") {
        router.push("/loading?type=login")
      } else {
        setError("Additional verification required.")
        setLoading(false)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
            "Invalid credentials"
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
            Autonomous{" "}
            <span className="text-accent">Thermal Orchestration</span> at your
            fingertips.
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
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Sign in to your EchoHeat dashboard
            </p>
          </div>

          {verified && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2.5 text-sm text-green-500"
            >
              <CheckCircle className="size-4 shrink-0" />
              Email verified! You can now sign in.
            </motion.div>
          )}

          {/* Google OAuth */}
          <button
            onClick={() =>
              signIn?.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
              })
            }
            className="
              flex w-full items-center justify-center gap-3 rounded-xl
              border border-border-default bg-surface-2 px-4 py-3
              text-sm font-medium text-text-primary
              transition-colors hover:bg-surface-3
            "
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border-default" />
            <span className="text-xs text-text-muted">
              or sign in with email
            </span>
            <span className="h-px flex-1 bg-border-default" />
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
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-text-primary"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@company.com"
                autoComplete="username"
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-text-primary"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-accent hover:underline"
            >
              Create account &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
