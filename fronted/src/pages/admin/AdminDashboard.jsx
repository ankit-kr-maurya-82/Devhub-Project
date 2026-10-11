import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'
import api from '../../lib/api.js'

const metrics = [
  ['totalUsers', 'Users', 'users'], ['activeUsers', 'Active accounts', 'check'], ['openReports', 'Open reports', 'shield'],
  ['totalBlogs', 'Blogs', 'book'], ['totalQuestions', 'Questions', 'message'], ['totalAnswers', 'Answers', 'message'],
  ['totalComments', 'Comments', 'message'], ['suspendedUsers', 'Suspended', 'shield'],
]
const actionLabel = action => action.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api.admin.dashboard().then(({ data }) => { if (active) setDashboard(data) }).catch(reason => { if (active) setError(reason.message || 'Could not load admin dashboard.') })
    return () => { active = false }
  }, [])
  if (!dashboard && !error) return <p role="status" className="p-8 text-sm text-[var(--muted)]">Loading admin dashboard…</p>
  return <div className="space-y-7"><header><h1 className="text-2xl font-bold">Admin dashboard</h1><p className="mt-2 text-sm text-[var(--muted)]">Account, content, and moderation activity.</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{error}</p>}
    {dashboard && <><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([key, label, icon]) => <article key={key} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><span className="text-sm text-[var(--muted)]">{label}</span><Icon name={icon} className="size-4 text-[var(--accent)]" /></div><p className="mt-3 text-2xl font-semibold">{dashboard.counts[key]}</p></article>)}</section>
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"><div className="flex items-center justify-between border-b border-[var(--border)] p-4"><h2 className="font-semibold">Recent moderation activity</h2><Link to="/admin/reports" className="text-sm text-[var(--accent)]">Reports</Link></div>{dashboard.recentModerationActivity.length ? <ul className="divide-y divide-[var(--border)]">{dashboard.recentModerationActivity.map(item => <li key={item._id} className="flex flex-wrap justify-between gap-2 p-4 text-sm"><span>{actionLabel(item.action)} · {item.targetType}</span><span className="text-[var(--muted)]">{item.actor?.username || 'Admin'} · {new Date(item.createdAt).toLocaleString()}</span></li>)}</ul> : <p className="p-8 text-center text-sm text-[var(--muted)]">No moderation activity yet.</p>}</section></>}
  </div>
}
