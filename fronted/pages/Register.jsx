import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../components/AuthField'
import AuthLayout from '../layouts/AuthLayout'
import { useMockSession } from '../src/state/useMockSession.js'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useMockSession()

  const updateField = event => {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined, ...(name === 'password' ? { confirmPassword: undefined } : {}) }))
    setSubmitted(false)
    setServerError('')
  }

  const submit = async event => {
    event.preventDefault()
    const nextErrors = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Enter your name using at least 2 characters.'
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) nextErrors.username = 'Use 3–20 letters, numbers, or underscores.'
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!form.password.trim() || form.password.length < 8) nextErrors.password = 'Use a password with at least 8 characters.'
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Your passwords don’t match.'

    setErrors(nextErrors)
    setSubmitted(false)
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      event.currentTarget.elements.namedItem(firstInvalidField)?.focus()
      return
    }
    setSubmitting(true)
    try {
      await register({ name: form.fullName.trim(), username: form.username.trim(), email: form.email.trim(), password: form.password })
      setSubmitted(true)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create an account" description="Add your details to get started with DevHub." mode="register">
      <form onSubmit={submit} noValidate aria-labelledby="auth-title" className="space-y-4">
        <AuthField id="register-full-name" name="fullName" label="Full name" autoComplete="name" minLength={2} maxLength={80} placeholder="Alex Morgan" value={form.fullName} onChange={updateField} error={errors.fullName} />
        <AuthField id="register-username" name="username" label="Username" autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={20} placeholder="alex_codes" hint="3–20 characters. Letters, numbers, and underscores." value={form.username} onChange={updateField} error={errors.username} />
        <AuthField id="register-email" name="email" label="Email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={form.email} onChange={updateField} error={errors.email} />
        <AuthField id="register-password" name="password" label="Password" type="password" autoComplete="new-password" minLength={8} placeholder="Create a password" hint="Use at least 8 characters." value={form.password} onChange={updateField} error={errors.password} />
        <AuthField id="register-confirm-password" name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={updateField} error={errors.confirmPassword} />

        <button type="submit" disabled={submitting} className="mt-2 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] active:bg-[var(--primary-hover)] disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <div role="status" aria-atomic="true">
          {serverError && <p role="alert" className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm leading-6 text-[var(--danger)]">{serverError}</p>}
          {submitted && <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm leading-6 text-[var(--success)]">Account created successfully.</p>}
        </div>
      </form>

      <p className="mt-6 border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--muted)]">
        Already have an account? <Link to="/login" className="rounded font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent)]">Log in</Link>
      </p>
    </AuthLayout>
  )
}
