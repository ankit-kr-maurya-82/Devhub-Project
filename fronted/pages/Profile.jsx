import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { useMockSession } from '../src/state/useMockSession.js'

export default function Profile() {
  const { user, updateProfile } = useMockSession()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', bio: '', skills: '' })

  async function submit(event) {
    event.preventDefault()
    setSaving(true); setError(''); setMessage('')
    try {
      await updateProfile({ name: form.name.trim(), bio: form.bio.trim(), skills: form.skills.split(',').map(skill => skill.trim()).filter(Boolean) })
      setMessage('Profile updated.')
      setEditing(false)
    } catch (requestError) { setError(requestError.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/dashboard" className="rounded text-sm text-[var(--muted)] hover:text-[var(--accent)]">← Dashboard</Link><button type="button" onClick={() => { if (!editing) setForm({ name: user?.name || '', bio: user?.bio || '', skills: (user?.skills || []).join(', ') }); setEditing(value => !value); setError(''); setMessage('') }} className="ui-button-secondary">{editing ? 'Cancel edit' : 'Edit profile'}</button></div>
      <header className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex items-center gap-4"><div role="img" aria-label={`${user?.name || user?.username}'s avatar`} className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl font-semibold text-[var(--accent)]">{(user?.name || user?.username || '?').slice(0, 1).toUpperCase()}</div><div className="min-w-0"><h1 className="break-words">{user?.name || user?.username}</h1><p className="mt-1 text-sm text-[var(--muted)]">@{user?.username}</p></div></div>
        <p className="mt-5 text-sm text-[var(--muted)]">{user?.email}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{user?.bio || 'No bio added.'}</p>
        <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[var(--border)] pt-5"><p className="text-sm"><span className="font-semibold tabular-nums">{user?.reputation ?? 0}</span><span className="ml-2 text-[var(--muted)]">reputation</span></p><div className="flex flex-wrap gap-2">{(user?.skills || []).map(skill => <span key={skill} className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs">{skill}</span>)}</div></div>
      </header>
      {editing && <form onSubmit={submit} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <label className="block text-sm font-medium">Display name<input maxLength={100} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <label className="block text-sm font-medium">Bio<textarea maxLength={300} rows={3} value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <label className="block text-sm font-medium">Skills, comma separated<input maxLength={1200} value={form.skills} onChange={event => setForm(current => ({ ...current, skills: event.target.value }))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
        <button disabled={saving} className="ui-button disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button>
      </form>}
      {message && <p role="status" className="text-sm text-[var(--success)]"><Icon name="check" className="mr-2 inline size-4" />{message}</p>}
    </div>
  )
}
