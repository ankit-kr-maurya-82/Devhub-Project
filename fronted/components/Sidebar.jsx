import { Link, NavLink } from 'react-router-dom'
import { navigation } from './navigation'
import Icon from './Icon'
import { useMockSession } from '../src/state/useMockSession.js'

export default function Sidebar({ onNavigate, compact = false }) {
  const { role } = useMockSession()

  return (
    <div className={`flex flex-col gap-6 p-4 ${compact ? '' : 'min-h-full'}`}>
      <Link to="/ask-question" onClick={onNavigate} className="ui-button w-full"><Icon name="plus" className="size-4" />Ask a question</Link>
      {['Explore', 'Your space'].map(group => (
        <nav key={group} aria-label={group}>
          <p className="mb-2 px-3 text-xs font-semibold text-[var(--subtle)]">{group}</p>
          <div className="space-y-1">
            {navigation.filter(item => item.group === group && (!item.role || item.role === role)).map(({ label, to, icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}><Icon name={icon} /><span>{label}</span></NavLink>
            ))}
          </div>
        </nav>
      ))}
      <div className="mt-auto border-t border-[var(--border)] px-3 pt-4 text-xs leading-5 text-[var(--subtle)]">
        <p className="font-medium text-[var(--muted)]">You’re exploring a preview</p>
        <p className="mt-1">Try the features with sample content.</p>
      </div>
    </div>
  )
}
