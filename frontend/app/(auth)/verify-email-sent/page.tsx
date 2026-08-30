"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Flame, Mail, ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react"

const OTP_LENGTH = 6
const RESEND_SECONDS = 60

function VerifyEmailSentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { signUp, isLoaded } = useSignUp()

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const [otp, setOtp] = React.useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [shaking, setShaking] = React.useState(false)
  const [resendTimer, setResendTimer] = React.useState(RESEND_SECONDS)
  const [resending, setResending] = React.useState(false)
  const [resent, setResent] = React.useState(false)

  React.useEffect(() => {
    if (resendTimer <= 0) return
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const digit = value.slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError(null)

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (digit && next.every((d) => d !== "")) {
      submitCode(next.join(""))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp]
      next[index - 1] = ""
      setOtp(next)
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (pasted.length === 0) return

    const next = [...otp]
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setOtp(next)

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()

    if (pasted.length === OTP_LENGTH) {
      submitCode(pasted)
    }
  }

  async function submitCode(code: string) {
    if (loading || !isLoaded || !signUp) return
    setLoading(true)
    setError(null)

    try {
      await signUp.attemptEmailAddressVerification({ code })
      router.push("/dashboard")
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
            "Incorrect code. Please try again."
      setError(message)
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      setOtp(Array(OTP_LENGTH).fill(""))
      inputRefs.current[0]?.focus()
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendTimer > 0 || resending || !isLoaded || !signUp) return
    setResending(true)

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setResent(true)
      setResendTimer(RESEND_SECONDS)
      setOtp(Array(OTP_LENGTH).fill(""))
      setError(null)
      inputRefs.current[0]?.focus()
    } catch {
      // silent
    } finally {
      setResending(false)
    }
  }

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15">
            <Flame className="size-5 text-accent" />
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-text-primary">
            EchoHeat
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-surface-1 p-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-accent/15">
            <Mail className="size-8 text-accent" />
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
            Check your email!
          </h1>
          <p className="mb-8 text-center text-sm text-text-muted">
            Enter the 6-digit code sent to{" "}
            {email ? (
              <span className="font-medium text-text-primary">{email}</span>
            ) : (
              "your email address"
            )}
          </p>

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

          <motion.div
            animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-3 mb-6"
          >
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                className={`
                  size-12 rounded-xl border-2 bg-surface-1 text-center text-xl font-bold
                  text-text-primary outline-none transition-all
                  focus:border-accent focus:ring-2 focus:ring-accent/20
                  disabled:opacity-50
                  ${error ? "border-accent-danger" : "border-border-default"}
                `}
              />
            ))}
          </motion.div>

          {loading && (
            <div className="flex justify-center mb-4">
              <Loader2 className="size-5 animate-spin text-accent" />
            </div>
          )}

          <div className="text-center mb-4">
            {resendTimer > 0 && !resent ? (
              <p className="text-sm text-text-muted">
                Resend code in{" "}
                <span className="font-medium text-text-primary">{formatTimer(resendTimer)}</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
              >
                {resent ? "Code resent!" : resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
            >
              <ArrowLeft className="size-4" />
              Wrong email? Go back
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailSentPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailSentContent />
    </React.Suspense>
  )
}
