import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'
import api from '../../lib/api.js'

const metrics = [
  ['totalUsers', 'Users', 'users'], ['newUsersLast7Days', 'New users · 7 days', 'users'],
  ['activeUsers', 'Active accounts', 'check'], ['suspendedUsers', 'Suspended', 'shield'],
  ['openReports', 'Open reports', 'shield'], ['totalBlogs', 'Blogs', 'book'],
  ['totalQuestions', 'Questions', 'message'], ['totalAnswers', 'Answers', 'message'],
  ['totalComments', 'Comments', 'message'], ['totalCodingProblems', 'Coding problems', 'code'],
  ['publishedCodingProblems', 'Published problems', 'code'], ['totalSubmissions', 'Submissions', 'code'],
]
const actionLabel = action => action.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [request, setRequest] = useState({ key: -1, status: 'loading', message: '' })
  const loading = request.key !== refresh || request.status === 'loading'
  const error = request.key === refresh && request.status === 'error' ? request.message : ''
  useEffect(() => {
    let active = true
    api.admin.dashboard()
      .then(({ data }) => {
        if (!active) return
        setDashboard(data)
        setRequest({ key: refresh, status: 'loaded', message: '' })
      })
      .catch(reason => {
        if (active) setRequest({ key: refresh, status: 'error', message: reason.message || 'Could not load admin dashboard.' })
      })
    return () => { active = false }
  }, [refresh])
  if (loading && !dashboard) return <p role="status" aria-live="polite" className="p-8 text-sm text-[var(--muted)]">Loading admin dashboard…</p>
  return <div className="min-w-0 space-y-6"><header><h1>Admin dashboard</h1><p className="mt-2 text-sm text-[var(--muted)]">Account, content, and moderation activity.</p></header>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--danger)] p-4 text-sm text-[var(--danger)]"><span>{error}</span><button type="button" onClick={() => setRefresh(value => value + 1)} className="ui-button-secondary">Retry</button></div>}
    {loading && dashboard && <p role="status" aria-live="polite" className="text-sm text-[var(--muted)]">Refreshing platform statistics…</p>}
    {dashboard && <><section aria-label="Platform statistics" className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([key, label, icon]) => <article key={key} className="ui-card min-w-0 p-4 sm:p-5"><div className="flex min-w-0 items-center justify-between gap-3"><span className="text-sm text-[var(--muted)]">{label}</span><Icon name={icon} className="size-4 shrink-0 text-[var(--accent)]" /></div><p className="mt-3 break-words text-2xl font-semibold tabular-nums">{dashboard.counts[key]}</p></article>)}</section>
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="ui-card min-w-0 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] p-4"><h2 className="font-semibold">Recently registered</h2><Link to="/admin/users" className="rounded text-sm text-[var(--accent)] underline-offset-4 hover:underline">Manage users</Link></div>{dashboard.recentUsers.length ? <ul className="divide-y divide-[var(--border)]">{dashboard.recentUsers.map(user => <li key={user._id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><span className="min-w-0"><span className="font-medium">{user.name || user.username}</span><span className="ml-2 break-all text-[var(--muted)]">@{user.username}</span></span><span className="text-[var(--muted)]">{new Date(user.createdAt).toLocaleDateString()} · {user.isActive ? 'Active' : 'Suspended'}</span></li>)}</ul> : <p className="p-8 text-center text-sm text-[var(--muted)]">No users have registered yet.</p>}</div>
        <div className="ui-card min-w-0 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] p-4"><h2 className="font-semibold">Recent moderation activity</h2><Link to="/admin/reports" className="rounded text-sm text-[var(--accent)] underline-offset-4 hover:underline">Reports</Link></div>{dashboard.recentModerationActivity.length ? <ul className="divide-y divide-[var(--border)]">{dashboard.recentModerationActivity.map(item => <li key={item._id} className="flex flex-wrap justify-between gap-2 p-4 text-sm"><span className="min-w-0">{actionLabel(item.action)} · {item.targetType}</span><span className="break-words text-[var(--muted)]">{item.actor?.username || 'Admin'} · {new Date(item.createdAt).toLocaleString()}</span></li>)}</ul> : <p className="p-8 text-center text-sm text-[var(--muted)]">No moderation activity yet.</p>}</div>
      </section></>}
  </div>
}
