import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ActivityFeed from '../components/ActivityFeed'
import Achievements from '../components/Achievements'
import ContributionOverview from '../components/ContributionOverview'
import Icon from '../components/Icon'
import CodingProfileStats from '../components/coding/CodingProfileStats'
import { developer, developerStats, formatDeveloperDate, profileAnswers, profileBlogs, profileQuestions } from '../data/developer'
import { useMockSession } from '../src/state/useMockSession.js'

const tabs = ['Overview', 'Questions', 'Answers', 'Blogs', 'Activity']
const postLists = { questions: profileQuestions, answers: profileAnswers, blogs: profileBlogs }

function PostList({ type }) {
  const posts = postLists[type]
  const total = developerStats.find(stat => stat.key === type).value
  return (
    <section aria-label={`Recent ${type}`} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] p-5 sm:p-6"><h2 className="text-lg font-semibold">Recent {type}</h2><p className="mt-1 text-xs text-[var(--muted)]">Showing {posts.length} recent {type} of {total} total · Sample content</p></div>
      <div className="divide-y divide-[var(--border)]">
        {posts.map(post => (
          <article key={post.id} className="p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]"><time dateTime={post.date}>{formatDeveloperDate(post.date)}</time>{post.accepted && <span className="rounded-full bg-[var(--surface-raised)] px-2 py-1 text-[var(--success)]">Accepted answer</span>}{post.resolved && <span className="rounded-full bg-[var(--surface-raised)] px-2 py-1 text-[var(--success)]">Resolved</span>}{post.readingTime && <span>{post.readingTime}</span>}</div>
            <h3 className="break-words text-base font-semibold leading-7 text-[var(--text)]">{post.title}</h3>
            <p className="mt-2 break-words text-sm leading-7 text-[var(--muted)]">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="rounded-md border border-[var(--border)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--accent)]">{tag}</span>)}</div>
            <p className="mt-4 text-xs text-[var(--muted)]">{type === 'blogs' ? `${post.likes} likes` : `${post.votes} votes`}{type === 'questions' && ` · ${post.answers} answers`}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Profile() {
  const { user, updateProfile } = useMockSession()
  const profile = user || developer
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [form, setForm] = useState(() => ({ name: user?.name || '', bio: user?.bio || '', skills: (user?.skills || []).join(', ') }))
  const [searchParams, setSearchParams] = useSearchParams()
  const tabRefs = useRef([])
  const requestedTab = searchParams.get('tab') || 'overview'
  const activeTab = tabs.some(tab => tab.toLowerCase() === requestedTab) ? requestedTab : 'overview'
  const reputation = developerStats.find(stat => stat.key === 'reputation').value

  const selectTab = tab => setSearchParams(current => {
    const next = new URLSearchParams(current)
    if (tab === 'overview') next.delete('tab')
    else next.set('tab', tab)
    return next
  }, { preventScrollReset: true })

  const handleTabKey = (event, index) => {
    let nextIndex
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabs.length - 1
    else return
    event.preventDefault()
    selectTab(tabs[nextIndex].toLowerCase())
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/dashboard" className="rounded text-sm text-[var(--muted)] hover:text-[var(--accent)]">← Dashboard</Link><span className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs text-[var(--accent)]">{user ? 'Your DevHub profile' : 'Sign in to view your account profile'}</span></div>
      <header className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div role="img" aria-label={`${profile.name || profile.username}'s avatar`} className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl font-semibold text-[var(--accent)]">{(profile.name || profile.username || 'D').slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0"><h1 className="break-words">{profile.name || profile.username || 'Developer'}</h1><p className="mt-1 break-words text-sm text-[var(--muted)]">@{profile.username}</p></div>
          </div>
          <div className="flex items-center gap-4"><div className="text-left sm:text-right"><p className="text-xl font-semibold tabular-nums">{(user?.reputation ?? reputation).toLocaleString('en-US')}</p><p className="text-xs text-[var(--muted)]">Reputation</p></div>{user && <button type="button" onClick={() => { setEditing(value => !value); setSaveError(''); setSaveMessage('') }} className="ui-button-secondary">{editing ? 'Cancel edit' : 'Edit profile'}</button>}</div>
        </div>
        <p className="mt-5 text-sm font-medium">{user?.email || developer.role}</p>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">{profile.bio || (user ? 'Add a short bio to tell the community about yourself.' : developer.bio)}</p>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)]">
          <li className="flex items-center gap-2"><Icon name="home" className="size-4" />{developer.location || 'Location not added'}</li>
          <li className="flex items-center gap-2"><Icon name="code" className="size-4" />{developer.github || 'GitHub not connected'}</li>
          <li className="flex items-center gap-2"><Icon name="clock" className="size-4" />Joined {developer.joined}</li>
        </ul>
      </header>

      {editing && user && <form onSubmit={async event => {
        event.preventDefault(); setSaving(true); setSaveError(''); setSaveMessage('')
        try {
          await updateProfile({ name: form.name.trim(), bio: form.bio.trim(), skills: form.skills.split(',').map(skill => skill.trim()).filter(Boolean) })
          setSaveMessage('Profile updated.')
          setEditing(false)
        } catch (error) { setSaveError(error.message) }
        finally { setSaving(false) }
      }} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <label className="block text-sm font-medium">Display name<input maxLength={100} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <label className="block text-sm font-medium">Bio<textarea maxLength={300} rows={3} value={form.bio} onChange={event => setForm(current => ({ ...current, bio: event.target.value }))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <label className="block text-sm font-medium">Skills, comma separated<input maxLength={1200} value={form.skills} onChange={event => setForm(current => ({ ...current, skills: event.target.value }))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        {saveError && <p role="alert" className="text-sm text-[var(--danger)]">{saveError}</p>}
        <button disabled={saving} className="ui-button disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button>
      </form>}
      {saveMessage && <p role="status" className="text-sm text-[var(--success)]">{saveMessage}</p>}

      <div role="tablist" aria-label="Developer profile sections" className="flex gap-1 overflow-x-auto border-b border-[var(--border)] px-1 py-1">
        {tabs.map((tab, index) => {
          const key = tab.toLowerCase()
          return <button key={key} ref={element => { tabRefs.current[index] = element }} type="button" role="tab" id={`profile-tab-${key}`} aria-controls={`profile-panel-${key}`} aria-selected={activeTab === key} tabIndex={activeTab === key ? 0 : -1} onClick={() => selectTab(key)} onKeyDown={event => handleTabKey(event, index)} className={`shrink-0 rounded-t-md border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:-outline-offset-2 ${activeTab === key ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-transparent text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}>{tab}</button>
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {tabs.map(tab => {
            const key = tab.toLowerCase()
            return <div key={key} role="tabpanel" id={`profile-panel-${key}`} aria-labelledby={`profile-tab-${key}`} hidden={activeTab !== key} tabIndex={0} className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400">
              {activeTab === key && (key === 'overview' ? (
                <div className="space-y-6">
                  <section aria-labelledby="profile-overview" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><h2 id="profile-overview" className="text-base font-semibold">Community contributions</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Questions, answers, and articles shared with the community.</p><dl className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">{developerStats.filter(stat => stat.key !== 'reputation').map(stat => <div key={stat.key}><dt className="text-xs leading-5 text-[var(--muted)]">{stat.label}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</dd></div>)}</dl></section>
                  <ContributionOverview />
                  <section aria-labelledby="profile-recent" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 id="profile-recent" className="text-base font-semibold">Recent activity</h2><button type="button" onClick={() => { selectTab('activity'); tabRefs.current[4]?.focus() }} className="rounded text-xs text-[var(--accent)] hover:text-[var(--accent)]">View all activity →</button></div><ActivityFeed limit={3} /></section>
                </div>
              ) : key === 'activity' ? (
                <section aria-labelledby="profile-all-activity" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><h2 id="profile-all-activity" className="text-lg font-semibold">Activity</h2><p className="mb-6 mt-1 text-xs text-[var(--muted)]">Recent questions, answers, articles, and milestones.</p><ActivityFeed /></section>
              ) : <PostList type={key} />)}
            </div>
          })}
        </div>
        <aside className="min-w-0 space-y-6">
          <CodingProfileStats />
          <section aria-labelledby="profile-skills" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><h2 id="profile-skills" className="text-base font-semibold">Skills</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Tools and technologies I work with.</p><ul className="mt-5 flex flex-wrap gap-2">{developer.skills.map(skill => <li key={skill} className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs text-[var(--text)]">{skill}</li>)}</ul></section>
          <section aria-labelledby="profile-achievements" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><h2 id="profile-achievements" className="mb-5 text-base font-semibold">Achievements</h2><Achievements /></section>
        </aside>
      </div>
    </div>
  )
}

