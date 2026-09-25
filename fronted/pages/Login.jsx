import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../components/AuthField'
import AuthLayout from '../layouts/AuthLayout'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showResetInfo, setShowResetInfo] = useState(false)

  const updateField = event => {
    const { name, value, type, checked } = event.target
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors(current => ({ ...current, [name]: undefined }))
    setSubmitted(false)
  }

  const submit = event => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!form.password.trim()) nextErrors.password = 'Enter your password.'

    setErrors(nextErrors)
    setSubmitted(false)
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      event.currentTarget.elements.namedItem(firstInvalidField)?.focus()
      return
    }
    setSubmitted(true)
    setShowResetInfo(false)
  }

  return (
    <AuthLayout title="Welcome back." description="Your next idea is waiting. Log in to DevHub." mode="login">
      <form onSubmit={submit} noValidate aria-labelledby="auth-title" className="space-y-5">
        <AuthField id="login-email" name="email" label="Email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={form.email} onChange={updateField} error={errors.email} />
        <AuthField id="login-password" name="password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={updateField} error={errors.password} />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-zinc-400">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={updateField} className="size-4 cursor-pointer rounded border-white/20 accent-violet-500" />
            Remember me
          </label>
          <button type="button" onClick={() => setShowResetInfo(visible => !visible)} aria-expanded={showResetInfo} aria-controls="password-reset-info" className="min-h-11 rounded text-sm font-medium text-violet-300 transition-colors hover:text-violet-200">
            Forgot password?
          </button>
        </div>
        <div id="password-reset-info" hidden={!showResetInfo}>
          {showResetInfo && <p role="status" className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-4 text-sm leading-6 text-violet-200">Password reset isn’t available in this preview yet.</p>}
        </div>

        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition-colors hover:bg-violet-400 active:bg-violet-600">
          Login <span aria-hidden="true">→</span>
        </button>
        <div role="status" aria-atomic="true">
          {submitted && <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm leading-6 text-emerald-200">Your details look good. Sign-in isn’t available in this preview yet.</p>}
        </div>
      </form>

      <p className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-zinc-400">
        New to DevHub? <Link to="/register" className="rounded font-semibold text-violet-300 transition-colors hover:text-violet-200">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
