import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../components/AuthField'
import AuthLayout from '../layouts/AuthLayout'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const updateField = event => {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined, ...(name === 'password' ? { confirmPassword: undefined } : {}) }))
    setSubmitted(false)
  }

  const submit = event => {
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
    setSubmitted(true)
  }

  return (
    <AuthLayout title="Create your account." description="Join a community that learns and builds together." mode="register">
      <form onSubmit={submit} noValidate aria-labelledby="auth-title" className="space-y-4">
        <AuthField id="register-full-name" name="fullName" label="Full Name" autoComplete="name" minLength={2} maxLength={80} placeholder="Alex Morgan" value={form.fullName} onChange={updateField} error={errors.fullName} />
        <AuthField id="register-username" name="username" label="Username" autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={20} placeholder="alex_codes" hint="3–20 characters. Letters, numbers, and underscores." value={form.username} onChange={updateField} error={errors.username} />
        <AuthField id="register-email" name="email" label="Email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={form.email} onChange={updateField} error={errors.email} />
        <AuthField id="register-password" name="password" label="Password" type="password" autoComplete="new-password" minLength={8} placeholder="Create a password" hint="Use at least 8 characters." value={form.password} onChange={updateField} error={errors.password} />
        <AuthField id="register-confirm-password" name="confirmPassword" label="Confirm Password" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={updateField} error={errors.confirmPassword} />

        <button type="submit" className="mt-2 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition-colors hover:bg-violet-400 active:bg-violet-600">
          Register <span aria-hidden="true">→</span>
        </button>
        <div role="status" aria-atomic="true">
          {submitted && <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm leading-6 text-emerald-200">Your details look good. Account creation isn’t available in this preview yet.</p>}
        </div>
      </form>

      <p className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-zinc-400">
        Already part of the community? <Link to="/login" className="rounded font-semibold text-violet-300 transition-colors hover:text-violet-200">Log in</Link>
      </p>
    </AuthLayout>
  )
}
