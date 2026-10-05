import { EmptyState, StatusBadge } from './AdminUI.jsx'
import { dangerButtonClass, formatDate, secondaryButtonClass } from './adminUtils.js'

function UserActions({ user, onView, onStatusChange }) {
  const nextAction = user.status === 'active' ? 'Suspend' : 'Activate'
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onView(user.id)} aria-label={`View ${user.name}`} className={`${secondaryButtonClass} min-h-10`}>View</button>
      <button type="button" onClick={() => onStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')} aria-label={`${nextAction} ${user.name}`} className={`${secondaryButtonClass} min-h-10`}>{nextAction}</button>
      <button type="button" disabled={user.status === 'deleted'} onClick={() => onStatusChange(user.id, 'deleted')} aria-label={`Delete ${user.name}`} className={`${dangerButtonClass} min-h-10`}>Delete</button>
    </div>
  )
}

function UserIdentity({ user }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">{user.initials}</span>
      <div className="min-w-0"><p className="font-medium text-[var(--text)]">{user.name}</p><p className="mt-1 break-all text-sm text-[var(--muted)]">{user.email}</p></div>
    </div>
  )
}

export default function UserTable({ users, onView, onStatusChange }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <ul className="divide-y divide-[var(--border)] xl:hidden">{users.map(user => (
        <li key={user.id} className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><UserIdentity user={user} /><StatusBadge status={user.status} /></div>
          <p className="text-sm text-[var(--muted)]">Joined {formatDate(user.joinedAt)} · {user.reputation.toLocaleString()} reputation</p>
          <UserActions user={user} onView={onView} onStatusChange={onStatusChange} />
        </li>
      ))}</ul>
      <div className="hidden max-w-full overflow-x-auto xl:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-raised)] text-xs text-[var(--muted)]"><tr>{['User', 'Reputation', 'Joined', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-[var(--border)]">{users.map(user => (
            <tr key={user.id} className="hover:bg-[var(--surface-raised)]">
              <td className="px-4 py-4"><UserIdentity user={user} /></td>
              <td className="px-4 py-4 text-[var(--muted)]">{user.reputation.toLocaleString()}</td>
              <td className="whitespace-nowrap px-4 py-4 text-[var(--muted)]">{formatDate(user.joinedAt)}</td>
              <td className="px-4 py-4"><StatusBadge status={user.status} /></td>
              <td className="px-4 py-4"><UserActions user={user} onView={onView} onStatusChange={onStatusChange} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {users.length === 0 && <EmptyState title="No users found" />}
    </div>
  )
}
