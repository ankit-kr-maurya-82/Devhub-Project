import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { useMockSession } from '../src/state/useMockSession.js'
import Avatar from '../components/Avatar.jsx'
import Badge from '../components/Badge.jsx'
import PageHeader from '../components/PageHeader.jsx'
import api from '../src/lib/api.js'

export default function Profile() {
  const { user, updateProfile } = useMockSession()
  const [params] = useSearchParams()
  const profileId = params.get('user')
  const isOwnProfile = !profileId || String(user?._id || user?.id) === profileId
  const [viewedUser, setViewedUser] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', bio: '', skills: '' })

  useEffect(() => {
    if (!profileId || isOwnProfile) return undefined
    let active = true
    api.users.profile(profileId).then(result => { if (active) { setViewedUser(result.data); setProfileError('') } }).catch(error => { if (active) setProfileError(error.message || 'Could not load this profile.') })
    return () => { active = false }
  }, [profileId, isOwnProfile])
  const profile = isOwnProfile ? user : viewedUser

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
      <Link to="/dashboard" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]">← Dashboard</Link>
      <section className="ui-card space-y-6 p-4 sm:p-7">
      <PageHeader eyebrow={isOwnProfile ? 'Your space' : 'Community member'} title={isOwnProfile ? 'Profile' : `${profile?.name || profile?.username || 'Member'}’s profile`} description={isOwnProfile ? 'Manage how you appear to the DevHub community.' : 'DevHub community profile.'} action={isOwnProfile && <button type="button" onClick={() => { if (!editing) setForm({ name: user?.name || '', bio: user?.bio || '', skills: (user?.skills || []).join(', ') }); setEditing(value => !value); setError(''); setMessage('') }} className="ui-button-secondary">{editing ? 'Cancel edit' : 'Edit profile'}</button>} />
        {profileError && <p role="alert" className="text-sm text-[var(--danger)]">{profileError}</p>}
        <div className="flex min-w-0 items-center gap-4 border-b border-[var(--border)] pb-5 sm:gap-5"><Avatar name={profile?.name || profile?.username} src={profile?.avatar} size="lg" className="size-16 text-xl sm:size-20 sm:text-2xl" /><div className="min-w-0"><p className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{profile?.name || profile?.username}</p><p className="mt-1 break-words text-sm text-[var(--muted)]">@{profile?.username}</p></div></div>
        <div className="mt-5 border-t border-[var(--border)] pt-4 sm:mt-6 sm:pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">About</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{profile?.bio || 'No bio added.'}</p>
        </div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4 border-t border-[var(--border)] pt-5"><p className="flex items-center gap-2 text-sm"><Badge variant="accent">{profile?.reputation ?? 0} reputation</Badge></p><div className="min-w-0 flex-1"><h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Skills</h2>{profile?.skills?.length ? <div className="flex flex-wrap gap-2">{profile.skills.map(skill => <Badge key={skill} variant="neutral" className="max-w-full break-words">{skill}</Badge>)}</div> : <p className="text-sm text-[var(--muted)]">No skills added.</p>}</div></div>
      </section>
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
