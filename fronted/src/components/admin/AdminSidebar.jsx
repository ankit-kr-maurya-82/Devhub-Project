import { Link, useLocation } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'

const links = [
  { to: '/admin', label: 'Overview', icon: 'grid' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/reports?targetType=question', label: 'Questions', icon: 'message' },
  { to: '/admin/reports?targetType=answer', label: 'Answers', icon: 'message' },
  { to: '/admin/reports?targetType=comment', label: 'Comments', icon: 'message' },
  { to: '/admin/reports?targetType=blog', label: 'Blogs', icon: 'book' },
  { to: '/admin/coding', label: 'Coding problems', icon: 'code' },
  { to: '/admin/reports', label: 'Reports', icon: 'shield' },
]

export default function AdminSidebar({ onNavigate, compact = false }) {
  const location = useLocation()
  const isLinkActive = to => {
    const target = new URL(to, window.location.origin)
    if (target.pathname !== location.pathname) return false
    const targetType = target.searchParams.get('targetType')
    return targetType ? new URLSearchParams(location.search).get('targetType') === targetType
      : target.pathname !== '/admin/reports' || !new URLSearchParams(location.search).has('targetType')
  }
  return <div className={compact ? 'min-w-0' : 'flex h-full flex-col p-4'}>{!compact && <div className="px-3 pb-6 pt-3"><span className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name="shield" className="size-5" /></span><p className="text-sm font-semibold text-[var(--text)]">Admin tools</p><p className="mt-1 text-sm text-[var(--subtle)]">Manage your community.</p></div>}<nav aria-label="Admin navigation" className={compact ? 'flex gap-1 overflow-x-auto p-2' : 'space-y-1'}>{links.map(({ to, label, icon }) => { const active = isLinkActive(to); return <Link key={to} to={to} aria-current={active ? 'page' : undefined} onClick={onNavigate} className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}><Icon name={icon} className="size-4 shrink-0" /><span className="whitespace-nowrap">{label}</span></Link>})}</nav>{!compact && <div className="mt-auto border-t border-[var(--border)] pt-4"><Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"><Icon name="home" className="size-4" />Back to DevHub</Link></div>}</div>
}
