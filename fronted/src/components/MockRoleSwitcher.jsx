import { useId } from 'react'
import { useMockSession } from '../state/useMockSession.js'

export default function MockRoleSwitcher() {
  const { role, setRole } = useMockSession()
  const id = useId()
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <label htmlFor={id} className="text-[var(--muted)]">Preview role</label>
      <select id={id} value={role} onChange={event => setRole(event.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[var(--text)]">
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>
  )
}
