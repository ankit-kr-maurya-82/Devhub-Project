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
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/dashboard" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]">← Dashboard</Link><button type="button" onClick={() => { if (!editing) setForm({ name: user?.name || '', bio: user?.bio || '', skills: (user?.skills || []).join(', ') }); setEditing(value => !value); setError(''); setMessage('') }} className="ui-button-secondary">{editing ? 'Cancel edit' : 'Edit profile'}</button></div>
      <header className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5"><div role="img" aria-label={`${user?.name || user?.username || 'User'} avatar placeholder`} className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] text-xl font-semibold text-[var(--accent)] sm:size-20">{(user?.name || user?.username || '?').slice(0, 1).toUpperCase()}</div><div className="min-w-0"><h1 className="break-words">{user?.name || user?.username}</h1><p className="mt-1 break-words text-sm text-[var(--muted)]">@{user?.username}</p></div></div>
        <div className="mt-5 border-t border-[var(--border)] pt-4 sm:mt-6 sm:pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Profile information</h2>
          <p className="mt-2 break-all text-sm text-[var(--text)]">{user?.email}</p>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{user?.bio || 'No bio added.'}</p>
        </div>
        <div className="mt-5 flex flex-wrap items-start gap-x-6 gap-y-4 border-t border-[var(--border)] pt-5"><p className="text-sm"><span className="font-semibold tabular-nums">{user?.reputation ?? 0}</span><span className="ml-2 text-[var(--muted)]">reputation</span></p><div className="min-w-0 flex-1"><h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Skills</h2>{user?.skills?.length ? <div className="flex flex-wrap gap-2">{user.skills.map(skill => <span key={skill} className="max-w-full break-words rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs text-[var(--text)]">{skill}</span>)}</div> : <p className="text-sm text-[var(--muted)]">No skills added.</p>}</div></div>
      </header>
      {editing && <form onSubmit={submit} aria-label="Edit profile" className="space-y-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Edit profile</h2>
        <label htmlFor="profile-name" className="block text-sm font-medium">Display name<input id="profile-name" maxLength={100} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="ui-input mt-2" /></label>
        <label htmlFor="profile-bio" className="block text-sm font-medium">Bio<textarea id="profile-bio" maxLength={300} rows={4} value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} className="ui-input mt-2 resize-y leading-6" /><span className="mt-1 block text-xs text-[var(--muted)]">Up to 300 characters.</span></label>
        <label htmlFor="profile-skills" className="block text-sm font-medium">Skills, comma separated<input id="profile-skills" maxLength={1200} value={form.skills} onChange={event => setForm(current => ({ ...current, skills: event.target.value }))} aria-describedby="profile-skills-hint" className="ui-input mt-2" /><span id="profile-skills-hint" className="mt-1 block text-xs text-[var(--muted)]">Separate each skill with a comma.</span></label>
        {error && <p role="alert" className="rounded-lg border border-[var(--danger)] p-3 text-sm text-[var(--danger)]">{error}</p>}
        <button disabled={saving} aria-busy={saving} className="ui-button disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button>
      </form>}
      {message && <p role="status" aria-live="polite" className="rounded-lg border border-[var(--success)] bg-[var(--surface)] p-3 text-sm text-[var(--success)]"><Icon name="check" className="mr-2 inline size-4" />{message}</p>}
    </div>
  )
}
