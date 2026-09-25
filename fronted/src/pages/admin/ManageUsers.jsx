import { useState } from 'react'
import UserTable from '../../components/admin/UserTable.jsx'
import { AdminPageHeader, DetailDialog, DetailField, Feedback, StatusBadge, TableToolbar } from '../../components/admin/AdminUI.jsx'
import { formatDate } from '../../components/admin/adminUtils.js'
import { useAdmin } from '../../state/useAdmin.js'

export default function ManageUsers() {
  const { users, updateUserStatus } = useAdmin()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const search = query.trim().toLowerCase()
  const filtered = users.filter(user => (status === 'all' || user.status === status) && `${user.name} ${user.username} ${user.email}`.toLowerCase().includes(search))
  const selected = users.find(user => user.id === selectedId)

  function changeStatus(id, nextStatus) {
    const user = users.find(item => item.id === id)
    if (!user || user.status === nextStatus) return
    updateUserStatus(id, nextStatus)
    setFeedback(`${user.name} is now ${nextStatus}.`)
  }

  return <div className="min-w-0"><AdminPageHeader title="Manage users" description="Get to know your members and manage access to the community." count={users.length} /><Feedback message={feedback} /><TableToolbar query={query} onQueryChange={setQuery} queryLabel="Search users" status={status} onStatusChange={setStatus} statuses={['active', 'suspended', 'deleted']} resultCount={filtered.length} /><UserTable users={filtered} onView={setSelectedId} onStatusChange={changeStatus} />{selected && <DetailDialog title="User details" onClose={() => setSelectedId(null)}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] font-semibold text-[var(--accent)]">{selected.initials}</span><div><h3 className="font-semibold">{selected.name}</h3><p className="mt-1 text-xs text-[var(--muted)]">@{selected.username}</p></div></div><StatusBadge status={selected.status} /></div><dl className="grid gap-5 sm:grid-cols-2"><DetailField label="Email">{selected.email}</DetailField><DetailField label="Reputation">{selected.reputation.toLocaleString()}</DetailField><DetailField label="Joined">{formatDate(selected.joinedAt)}</DetailField><DetailField label="Account status"><span className="capitalize">{selected.status}</span></DetailField></dl></DetailDialog>}</div>
}
