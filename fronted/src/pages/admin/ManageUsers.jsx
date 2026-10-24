import { useEffect, useState } from 'react'
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
    {!loading && error?.key !== key && <><div className="overflow-x-auto rounded-xl border border-[var(--border)]" role="region" aria-label="User accounts table" tabIndex="0"><table className="w-full min-w-180 text-left text-sm"><caption className="sr-only">Administer user accounts</caption><thead className="bg-[var(--surface-raised)]"><tr>{['User', 'Role', 'Reputation', 'Joined', 'Status', 'Action'].map(label => <th scope="col" key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{result.data.map(item => { const isSelf = String(currentUser?._id || currentUser?.id) === String(item._id); return <tr key={item._id}><td className="max-w-80 px-4 py-3"><div className="break-words font-medium">{item.name || item.username}</div><div className="break-all text-xs text-[var(--muted)]">@{item.username} · {item.email}</div></td><td className="px-4 py-3 capitalize">{item.role}</td><td className="px-4 py-3 tabular-nums">{item.reputation}</td><td className="whitespace-nowrap px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td><td className="px-4 py-3"><span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium" style={{ color: item.isActive ? 'var(--success)' : 'var(--warning)', borderColor: item.isActive ? 'var(--success)' : 'var(--warning)' }}>{item.isActive ? 'Active' : 'Suspended'}</span></td><td className="px-4 py-3"><button type="button" disabled={isSelf || busyId === String(item._id)} title={isSelf ? 'You cannot change your own account status' : undefined} onClick={() => toggle(item)} className={`${item.isActive ? 'ui-button-danger' : 'ui-button-secondary'} whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40`}>{busyId === String(item._id) ? 'Saving…' : item.isActive ? 'Suspend' : 'Reactivate'}</button>{isSelf && <span className="ml-2 text-xs text-[var(--muted)]">Current admin</span>}</td></tr> })}</tbody></table>{!result.data.length && <p className="p-8 text-center text-sm text-[var(--muted)]">No users match this search.</p>}</div><Pager pagination={result.pagination} page={page} setPage={setPage} /></>}
  </div>
}

function Pager({ pagination, page, setPage }) {
  return <nav aria-label="User pages" className="flex flex-wrap items-center justify-center gap-3"><button type="button" disabled={!pagination?.hasPrevPage} onClick={() => setPage(Number(page) - 1)} className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span aria-live="polite" className="text-sm text-[var(--muted)]">Page {pagination?.page || 1} of {Math.max(1, pagination?.totalPages || 1)}</span><button type="button" disabled={!pagination?.hasNextPage} onClick={() => setPage(Number(page) + 1)} className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav>
}
