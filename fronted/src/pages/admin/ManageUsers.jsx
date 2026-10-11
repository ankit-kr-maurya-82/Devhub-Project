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

  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Manage users</h1><p className="mt-2 text-sm text-[var(--muted)]">Search accounts and manage access. Passwords and authentication secrets are never returned.</p></header>
    <section className="flex flex-wrap gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><label className="min-w-56 flex-1 text-sm">Search<input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} maxLength="100" placeholder="Name, username, or email" className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label><label className="text-sm">Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }} className="mt-1 block rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2"><option value="">All accounts</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label></section>
    {loading && <p role="status" className="p-6 text-center text-sm text-[var(--muted)]">Loading users…</p>}
    {!loading && error?.key === key && <p role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{error.message} <button onClick={() => setRefresh(value => value + 1)} className="ml-2 underline">Retry</button></p>}
    {!loading && error?.key !== key && <><div className="overflow-x-auto rounded-xl border border-[var(--border)]"><table className="w-full min-w-180 text-left text-sm"><thead className="bg-[var(--surface-raised)]"><tr>{['User', 'Role', 'Reputation', 'Joined', 'Status', 'Action'].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{result.data.map(item => { const isSelf = String(currentUser?._id || currentUser?.id) === String(item._id); return <tr key={item._id}><td className="px-4 py-3"><div className="font-medium">{item.name || item.username}</div><div className="text-xs text-[var(--muted)]">@{item.username} · {item.email}</div></td><td className="px-4 py-3 capitalize">{item.role}</td><td className="px-4 py-3">{item.reputation}</td><td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td><td className="px-4 py-3">{item.isActive ? 'Active' : 'Suspended'}</td><td className="px-4 py-3"><button disabled={isSelf || busyId === String(item._id)} title={isSelf ? 'You cannot change your own account status' : ''} onClick={() => toggle(item)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs disabled:opacity-40">{busyId === String(item._id) ? 'Saving…' : item.isActive ? 'Suspend' : 'Reactivate'}</button>{isSelf && <span className="ml-2 text-xs text-[var(--muted)]">Current admin</span>}</td></tr> })}</tbody></table>{!result.data.length && <p className="p-8 text-center text-sm text-[var(--muted)]">No users match this search.</p>}</div><Pager pagination={result.pagination} page={page} setPage={setPage} /></>}
  </div>
}

function Pager({ pagination, page, setPage }) {
  return <nav aria-label="User pages" className="flex items-center justify-center gap-4"><button disabled={!pagination?.hasPrevPage} onClick={() => setPage(Number(page) - 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Previous</button><span className="text-sm text-[var(--muted)]">Page {pagination?.page || 1} of {Math.max(1, pagination?.totalPages || 1)}</span><button disabled={!pagination?.hasNextPage} onClick={() => setPage(Number(page) + 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Next</button></nav>
}
