import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthField from '../components/AuthField.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'
import api from '../src/lib/api.js'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault(); setError('')
    if (password !== confirmPassword) { setError('Your passwords do not match.'); return }
    setSubmitting(true)
    try { await api.auth.resetPassword(token, { password, confirmPassword }); navigate('/login', { replace: true }) }
    catch (requestError) { setError(requestError.message) }
    finally { setSubmitting(false) }
  }

  return <AuthLayout title="Choose a new password" description="Set a new password for your DevHub account." mode="login"><form onSubmit={submit} className="space-y-5"><AuthField id="new-password" name="password" label="New password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /><AuthField id="confirm-password" name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /><button disabled={submitting} className="ui-button min-h-12 w-full justify-center disabled:opacity-60">{submitting ? 'Updating…' : 'Update password'}</button>{error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}</form><p className="mt-6 text-center text-sm text-[var(--muted)]"><Link to="/login" className="text-[var(--accent)]">Back to log in</Link></p></AuthLayout>
}
