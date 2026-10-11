import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../src/lib/api.js'
import { useMockSession } from '../src/state/useMockSession.js'

export default function ReportButton({ targetType, targetId }) {
  const { user } = useMockSession()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!targetId) return null
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await api.reports.create({ targetType, targetId, reason, details }); setMessage('Report sent to the moderation team.'); setOpen(false) }
    catch (cause) { setError(cause.message || 'Could not submit report.') }
    finally { setBusy(false) }
  }
  if (!user) return <Link to="/login" className="text-xs text-[var(--muted)] underline">Sign in to report</Link>
  return <span className="inline-flex items-center gap-2"><button type="button" onClick={() => { setOpen(true); setMessage('') }} className="text-xs text-[var(--muted)] underline">Report</button>{message && <span role="status" className="text-xs text-[var(--success)]">{message}</span>}{error && !open && <span role="alert" className="text-xs text-[var(--danger)]">{error}</span>}{open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"><div><h2 className="text-lg font-semibold">Report {targetType}</h2><p className="mt-1 text-sm text-[var(--muted)]">Reports are visible to administrators.</p></div><label className="block text-sm">Reason<select value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2">{['spam', 'harassment', 'abuse', 'misinformation', 'copyright', 'other'].map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="block text-sm">Details<textarea value={details} onChange={event => setDetails(event.target.value)} maxLength="2000" rows="4" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>{error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}<div className="flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => setOpen(false)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm">Cancel</button><button disabled={busy} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">{busy ? 'Sending…' : 'Submit report'}</button></div></form></div>}</span>
}
