import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../components/AuthField'
import AuthLayout from '../layouts/AuthLayout'
import { useMockSession } from '../src/state/useMockSession.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useMockSession()

  const updateField = event => {
    const { name, value, type, checked } = event.target
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors(current => ({ ...current, [name]: undefined }))
    setSubmitted(false)
    setServerError('')
  }

  const submit = async event => {
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
    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      setSubmitted(true)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Log in" description="Enter your email and password to continue." mode="login">
      <form onSubmit={submit} noValidate aria-labelledby="auth-title" className="space-y-5">
        <AuthField id="login-email" name="email" label="Email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={form.email} onChange={updateField} error={errors.email} />
        <AuthField id="login-password" name="password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={updateField} error={errors.password} />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[var(--muted)]">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={updateField} className="size-4 cursor-pointer rounded border-[var(--border)] accent-[var(--primary)]" />
            Remember me
          </label>
          <Link to="/forgot-password" className="min-h-11 rounded py-3 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent)]">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={submitting} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] active:bg-[var(--primary-hover)] disabled:opacity-60">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <div role="status" aria-atomic="true">
          {serverError && <p role="alert" className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm leading-6 text-[var(--danger)]">{serverError}</p>}
          {submitted && <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm leading-6 text-[var(--success)]">Signed in successfully.</p>}
        </div>
      </form>

      <p className="mt-6 border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--muted)]">
        New to DevHub? <Link to="/register" className="rounded font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent)]">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
