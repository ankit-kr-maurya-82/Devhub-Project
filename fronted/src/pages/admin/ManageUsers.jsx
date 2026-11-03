import { Fragment, useEffect, useState } from 'react'
import { useMockSession } from '../../state/useMockSession.js'
import api from '../../lib/api.js'

export default function ManageUsers() {
  const { user: currentUser } = useMockSession()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)
  const [result, setResult] = useState({ data: [], pagination: null })
  const [loadedKey, setLoadedKey] = useState('')
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState('')
  const [expandedId, setExpandedId] = useState('')
  const key = `${page}|${search}|${status}|${refresh}`
  const loading = loadedKey !== key && error?.key !== key

  useEffect(() => {
    let active = true
    api.admin.users({ page: String(page), limit: '20', ...(search && { search }), ...(status && { status }) })
      .then(payload => { if (active) { setResult(payload); setLoadedKey(key); setError(null) } })
      .catch(reason => { if (active) setError({ key, message: reason.message || 'Could not load users.' }) })
    return () => { active = false }
  }, [key, page, search, status])

  async function toggle(user) {
    if (String(currentUser?._id || currentUser?.id) === String(user._id) || busyId) return
    const action = user.isActive ? 'suspend' : 'reactivate'
    if (!window.confirm(`${action === 'suspend' ? 'Suspend' : 'Reactivate'} @${user.username}?`)) return
    setBusyId(String(user._id))
    try { await api.admin.setUserActive(user._id, !user.isActive); setRefresh(value => value + 1) }
    catch (reason) { setError({ key, message: reason.message || 'Could not update account status.' }) }
    finally { setBusyId('') }
  }

  return <div className="min-w-0 space-y-5"><header><h1>Manage users</h1><p className="mt-2 text-sm text-[var(--muted)]">Search accounts and manage access. Passwords and authentication secrets are never returned.</p></header>
    <section aria-label="User filters" className="ui-card flex flex-wrap gap-3 p-4"><label className="min-w-56 flex-1 text-sm font-medium">Search<input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} maxLength="100" placeholder="Name, username, or email" className="ui-input mt-1" /></label><label className="min-w-44 text-sm font-medium">Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }} className="ui-input mt-1"><option value="">All accounts</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label></section>
    {loading && <p role="status" aria-live="polite" className="p-6 text-center text-sm text-[var(--muted)]">Loading users…</p>}
    {!loading && error?.key === key && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--danger)] p-4 text-sm text-[var(--danger)]"><span>{error.message}</span><button type="button" onClick={() => setRefresh(value => value + 1)} className="ui-button-secondary">Retry</button></div>}
    {!loading && error?.key !== key && <><div className="overflow-x-auto rounded-xl border border-[var(--border)]" role="region" aria-label="User accounts table" tabIndex="0"><table className="w-full min-w-240 text-left text-sm"><caption className="sr-only">Administer user accounts</caption><thead className="bg-[var(--surface-raised)]"><tr>{['User', 'Profile', 'Role', 'Reputation', 'Joined', 'Last seen', 'Status', 'Action'].map(label => <th scope="col" key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{result.data.map(item => { const isSelf = String(currentUser?._id || currentUser?.id) === String(item._id); const isExpanded = expandedId === String(item._id); return <Fragment key={item._id}><tr><td className="max-w-80 px-4 py-3"><div className="flex items-center gap-3">{item.avatar && <img src={item.avatar} alt="" loading="lazy" className="size-10 shrink-0 rounded-full object-cover" />}<div className="min-w-0"><div className="break-words font-medium">{item.name || item.username}</div><div className="break-all text-xs text-[var(--muted)]">@{item.username} · {item.email}</div></div></div></td><td className="max-w-80 px-4 py-3"><p className="break-words">{item.bio || 'No bio'}</p><p className="mt-1 break-words text-xs text-[var(--muted)]">Skills: {item.skills?.length ? item.skills.join(', ') : 'None'}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.isOnline ? 'Online' : 'Offline'}</p></td><td className="px-4 py-3 capitalize">{item.role}</td><td className="px-4 py-3 tabular-nums">{item.reputation}</td><td className="whitespace-nowrap px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td><td className="whitespace-nowrap px-4 py-3">{item.lastSeen ? new Date(item.lastSeen).toLocaleString() : 'Unknown'}</td><td className="px-4 py-3"><span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium" style={{ color: item.isActive ? 'var(--success)' : 'var(--warning)', borderColor: item.isActive ? 'var(--success)' : 'var(--warning)' }}>{item.isActive ? 'Active' : 'Suspended'}</span></td><td className="space-y-2 px-4 py-3"><button type="button" aria-expanded={isExpanded} onClick={() => setExpandedId(isExpanded ? '' : String(item._id))} className="ui-button-secondary whitespace-nowrap">{isExpanded ? 'Hide activity' : 'View all data'}</button><button type="button" disabled={isSelf || busyId === String(item._id)} title={isSelf ? 'You cannot change your own account status' : undefined} onClick={() => toggle(item)} className={`${item.isActive ? 'ui-button-danger' : 'ui-button-secondary'} whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40`}>{busyId === String(item._id) ? 'Saving…' : item.isActive ? 'Suspend' : 'Reactivate'}</button></td></tr>{isExpanded && <tr><td colSpan="8" className="bg-[var(--surface-raised)] p-4"><UserActivity userId={item._id} /></td></tr>}</Fragment> })}</tbody></table>{!result.data.length && <p className="p-8 text-center text-sm text-[var(--muted)]">No users match this search.</p>}</div><Pager pagination={result.pagination} page={page} setPage={setPage} /></>}
  </div>
}

const activityTypes = ['questions', 'answers', 'comments', 'blogs', 'submissions', 'rooms', 'messages']
const activityTitle = item => item.title || item.question?.title || item.problem?.title || item.room?.name || item.name || item.targetType || item.language
const activityBody = item => item.description || item.content || item.verdict || item.slug || item.category || ''

function UserActivity({ userId }) {
  const [pages, setPages] = useState(Object.fromEntries(activityTypes.map(type => [type, 1])))
  const [results, setResults] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all(activityTypes.map(async type => [type, await api.admin.userActivity(userId, { type, page: String(pages[type]), limit: '10' })]))
      .then(entries => { if (active) { setResults(Object.fromEntries(entries)); setError('') } })
      .catch(reason => { if (active) setError(reason.message || 'Could not load user activity.') })
    return () => { active = false }
  }, [userId, pages])

  if (error) return <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>
  if (activityTypes.some(type => !results[type])) return <p role="status" className="text-sm text-[var(--muted)]">Loading user activity…</p>
  return <div className="grid gap-4 md:grid-cols-2">{activityTypes.map(type => {
    const result = results[type]
    return <section key={type} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><h2 className="font-semibold capitalize">{type} <span className="text-sm font-normal text-[var(--muted)]">({result.pagination.total})</span></h2>{result.data.length ? <ul className="mt-3 divide-y divide-[var(--border)]">{result.data.map(record => <li key={record._id} className="py-3"><p className="break-words font-medium">{activityTitle(record) || 'Activity'}</p><p className="mt-1 line-clamp-3 break-words text-sm text-[var(--muted)]">{activityBody(record)}</p><p className="mt-1 text-xs text-[var(--muted)]">{record.createdAt ? new Date(record.createdAt).toLocaleString() : ''}{record.moderationStatus === 'hidden' ? ' · Hidden' : ''}</p></li>)}</ul> : <p className="mt-3 text-sm text-[var(--muted)]">No {type}.</p>}{result.pagination.totalPages > 1 && <nav aria-label={`${type} pages`} className="mt-3 flex items-center justify-between"><button type="button" disabled={!result.pagination.hasPrevPage} onClick={() => setPages(current => ({ ...current, [type]: current[type] - 1 }))} className="ui-button-secondary disabled:opacity-40">Previous</button><span className="text-xs text-[var(--muted)]">{result.pagination.page} / {result.pagination.totalPages}</span><button type="button" disabled={!result.pagination.hasNextPage} onClick={() => setPages(current => ({ ...current, [type]: current[type] + 1 }))} className="ui-button-secondary disabled:opacity-40">Next</button></nav>}</section>
  })}</div>
}

function Pager({ pagination, page, setPage }) {
  return <nav aria-label="User pages" className="flex flex-wrap items-center justify-center gap-3"><button type="button" disabled={!pagination?.hasPrevPage} onClick={() => setPage(Number(page) - 1)} className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span aria-live="polite" className="text-sm text-[var(--muted)]">Page {pagination?.page || 1} of {Math.max(1, pagination?.totalPages || 1)}</span><button type="button" disabled={!pagination?.hasNextPage} onClick={() => setPage(Number(page) + 1)} className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav>
}
