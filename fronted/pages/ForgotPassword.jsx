import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../components/AuthField.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import api from '../src/lib/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true); setError(''); setMessage('')
    try {
      const result = await api.auth.forgotPassword(email.trim())
      setMessage(result.message)
    } catch (requestError) { setError(requestError.message) }
    finally { setSubmitting(false) }
  }

  return <AuthLayout title="Reset your password" description="Enter your account email to request a password reset link." mode="login"><form onSubmit={submit} className="space-y-5"><AuthField id="reset-email" name="email" label="Email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /><button disabled={submitting} className="ui-button min-h-12 w-full justify-center disabled:opacity-60">{submitting ? 'Sending…' : 'Send reset link'}</button>{error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}{message && <p role="status" className="text-sm text-[var(--success)]">{message}</p>}</form><p className="mt-6 text-center text-sm text-[var(--muted)]"><Link to="/login" className="text-[var(--accent)]">Back to log in</Link></p></AuthLayout>
}
