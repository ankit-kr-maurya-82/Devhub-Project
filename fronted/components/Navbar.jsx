import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import SearchBar from './SearchBar'
import { navigation } from './navigation'
import NotificationBell from '../src/components/notifications/NotificationBell.jsx'
import { useMockSession } from '../src/state/useMockSession.js'

export default function Navbar({ menuOpen, onMenuToggle, menuButtonRef, showWorkspaceMenu = false }) {
  const { role, theme, toggleTheme } = useMockSession()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex min-h-18 max-w-450 items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <button ref={menuButtonRef} type="button" onClick={onMenuToggle} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className={`shrink-0 rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)] ${showWorkspaceMenu ? 'xl:hidden' : 'lg:hidden'}`}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        <Link to="/" aria-label="DevHub home" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-[var(--text)] sm:gap-2.5 sm:text-xl lg:w-40"><span className="flex size-9 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/15"><Icon name="code" className="size-5" /></span>Dev<span className="-ml-2 text-[var(--accent)]">Hub</span></Link>
        <div className="hidden min-w-32 max-w-72 flex-1 md:flex xl:max-w-40 2xl:max-w-72"><SearchBar /></div>
        <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 xl:flex">
          {navigation.filter(item => item.primary && (!item.role || item.role === role)).map(({ label, to }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `whitespace-nowrap rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}>{label}</NavLink>)}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {role === 'admin' && <Link to="/admin" aria-label="Admin Panel" title="Admin Panel" className="hidden size-9 items-center justify-center rounded-lg text-[var(--accent)] hover:bg-[var(--accent-soft)] sm:flex"><Icon name="shield" /></Link>}
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-raised)]"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
          <NotificationBell />
          <Link to="/login" className="hidden rounded-lg px-2 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] sm:block">Login</Link>
          <Link to="/register" className="hidden rounded-lg bg-violet-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-400 sm:block">Register</Link>
          <Link to="/profile" aria-label="Your profile" className="hidden size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted)] hover:border-violet-400 2xl:flex"><Icon name="user" /></Link>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><SearchBar /></div>
    </header>
  )
}
