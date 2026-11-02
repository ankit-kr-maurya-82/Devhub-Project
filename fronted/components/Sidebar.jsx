import { NavLink, useLocation } from 'react-router-dom'
import { navigationFor } from './navigation'
import Icon from './Icon'
import { useMockSession } from '../src/state/useMockSession.js'

export default function Sidebar({ onNavigate, compact = false }) {
  const { user, role } = useMockSession()
  const location = useLocation()
  const items = navigationFor(user, role)
  const groups = ['Explore', 'Your space', 'Admin tools'].filter(group => items.some(item => item.group === group))

  return (
    <div className={`flex flex-col gap-6 p-4 ${compact ? '' : 'min-h-full'}`}>
      {user && <NavLink to="/ask-question" onClick={onNavigate} aria-current={location.pathname === '/ask-question' ? 'page' : undefined} className="ui-button w-full"><Icon name="plus" className="size-4" />Ask a question</NavLink>}
      {groups.map(group => (
        <nav key={group} aria-label={group}>
          <p className="mb-2 px-3 text-xs font-semibold text-[var(--subtle)]">{group}</p>
          <div className="space-y-1">
            {items.filter(item => item.group === group).map(({ label, to, icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}><Icon name={icon} /><span>{label}</span></NavLink>
            ))}
          </div>
        </nav>
      ))}
    </div>
  )
}
