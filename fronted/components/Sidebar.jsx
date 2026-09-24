import { Link, NavLink } from 'react-router-dom'
import { navigation } from './navigation'
import Icon from './Icon'

export default function Sidebar({ onNavigate, compact = false }) {
  return (
    <div className={`flex flex-col p-4 ${compact ? '' : 'min-h-full'}`}>
      <p className="px-3 pb-4 pt-3 text-[10px] font-semibold tracking-[0.2em] text-zinc-500">WORKSPACE</p>
      <nav aria-label="Workspace navigation" className="space-y-1">
        {navigation.map(({ label, to, icon }, index) => <div key={to} className={index === 6 ? 'mt-6 border-t border-white/10 pt-5' : ''}><NavLink to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-violet-500/15 font-medium text-violet-300 ring-1 ring-inset ring-violet-400/20' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}`}><Icon name={icon} /><span>{label}</span></NavLink></div>)}
      </nav>
      {!compact && <div className="mt-8 rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
        <span className="font-mono text-xs text-violet-400">&lt;hello, developer /&gt;</span>
        <p className="mt-2 text-sm font-medium text-zinc-200">Build. Learn. Connect.</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Your next idea starts with a great conversation.</p>
        <Link to="/ask-question" onClick={onNavigate} className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-violet-400/25 py-2 text-xs font-medium text-violet-300 hover:bg-violet-400/10"><Icon name="plus" className="size-4" />Start a discussion</Link>
      </div>}
      {!compact && <div className="mt-auto pt-8 text-xs text-zinc-600"><span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-400" />Made for curious minds.</div>}
    </div>
  )
}
