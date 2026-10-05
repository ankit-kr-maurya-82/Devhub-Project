import { useId } from 'react'
import { useMockSession } from '../state/useMockSession.js'

export default function MockRoleSwitcher() {
  const { role, setRole } = useMockSession()
  const id = useId()
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label htmlFor={id} className="text-[var(--muted)]">Preview as</label>
      <select id={id} value={role} onChange={event => setRole(event.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[var(--text)]">
        <option value="user">Regular user</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  )
}
