import { Link, NavLink } from 'react-router-dom'
import { navigation } from './navigation'
import Icon from './Icon'
import MockRoleSwitcher from '../src/components/MockRoleSwitcher.jsx'
import { useMockSession } from '../src/state/useMockSession.js'

export default function Sidebar({ onNavigate, compact = false }) {
  const { role } = useMockSession()
  const visibleNavigation = navigation.filter(item => !item.role || item.role === role)

  return (
    <div className={`flex flex-col p-4 ${compact ? '' : 'min-h-full'}`}>
      <p className="px-3 pb-4 pt-3 text-[10px] font-semibold tracking-[0.2em] text-[var(--subtle)]">WORKSPACE</p>
      <nav aria-label="Workspace navigation" className="space-y-1">
        {visibleNavigation.map(({ label, to, icon }, index) => <div key={to} className={index === 6 ? 'mt-6 border-t border-[var(--border)] pt-5' : ''}><NavLink to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-[var(--accent-soft)] font-medium text-[var(--accent)] ring-1 ring-inset ring-violet-400/20' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}><Icon name={icon} /><span>{label}</span></NavLink></div>)}
      </nav>
      <div className="mt-5 border-t border-[var(--border)] px-3 pt-4">
        <MockRoleSwitcher />
        <p className="mt-2 text-[10px] leading-4 text-[var(--subtle)]">Phase 1 mock account</p>
      </div>
      {!compact && <div className="mt-6 rounded-xl border border-violet-400/15 bg-[var(--accent-soft)] p-4">
        <span className="font-mono text-xs text-[var(--accent)]">&lt;hello, developer /&gt;</span>
        <p className="mt-2 text-sm font-medium text-[var(--text)]">Build. Learn. Connect.</p>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Your next idea starts with a great conversation.</p>
        <Link to="/ask-question" onClick={onNavigate} className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-violet-400/25 py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--surface-raised)]"><Icon name="plus" className="size-4" />Start a discussion</Link>
      </div>}
      {!compact && <div className="mt-auto pt-8 text-xs text-[var(--subtle)]"><span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-400" />Made for curious minds.</div>}
    </div>
  )
}
