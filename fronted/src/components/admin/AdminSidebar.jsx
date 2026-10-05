import { NavLink, Link } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'

const links = [
  { to: '/admin', label: 'Overview', icon: 'grid' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/questions', label: 'Questions', icon: 'message' },
  { to: '/admin/blogs', label: 'Blogs', icon: 'book' },
  { to: '/admin/reports', label: 'Reports', icon: 'shield' },
]

export default function AdminSidebar({ onNavigate, compact = false }) {
  return <div className={compact ? 'min-w-0' : 'flex h-full flex-col p-4'}>{!compact && <div className="px-3 pb-6 pt-3"><span className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name="shield" className="size-5" /></span><p className="text-sm font-semibold text-[var(--text)]">Admin tools</p><p className="mt-1 text-sm text-[var(--subtle)]">Manage your community.</p></div>}<nav aria-label="Admin navigation" className={compact ? 'flex gap-1 overflow-x-auto p-2' : 'space-y-1'}>{links.map(({ to, label, icon }) => <NavLink key={to} to={to} end={to === '/admin'} onClick={onNavigate} className={({ isActive }) => `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}><Icon name={icon} className="size-4 shrink-0" /><span className="whitespace-nowrap">{label}</span></NavLink>)}</nav>{!compact && <div className="mt-auto border-t border-[var(--border)] pt-4"><Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"><Icon name="home" className="size-4" />Back to DevHub</Link></div>}</div>
}
