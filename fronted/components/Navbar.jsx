import { Link, NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import SearchBar from './SearchBar'
import NotificationBell from '../src/components/notifications/NotificationBell.jsx'
import { useMockSession } from '../src/state/useMockSession.js'

const navClass = ({ isActive }) => `site-nav-link ${isActive ? 'is-active' : ''}`

export default function Navbar({ menuOpen, onMenuToggle, menuButtonRef, showWorkspaceMenu = false }) {
  const { theme, toggleTheme, user, role, logout } = useMockSession()
  const navigate = useNavigate()

  return (
    <header className="site-header sticky top-0 z-30 border-b border-[var(--border)]">
      <div className="site-header-inner mx-auto flex min-h-18 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button ref={menuButtonRef} type="button" onClick={onMenuToggle} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-raised)] ${showWorkspaceMenu ? '' : 'lg:hidden'}`}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        <Link to="/" aria-label="DevHub home" className="site-wordmark shrink-0">DevHub</Link>
        <nav aria-label="Main navigation" className="site-nav hidden items-center gap-6 lg:flex">
          <NavLink to="/questions" className={navClass}>Questions</NavLink>
          <NavLink to="/blogs" className={navClass}>Stories</NavLink>
          {user && <NavLink to="/community" className={navClass}>Community</NavLink>}
          {user && <NavLink to="/dashboard" className={navClass}>My space</NavLink>}
          {role === 'admin' && <NavLink to="/admin" className={navClass}>Admin</NavLink>}
        </nav>
        <div className="site-search hidden min-w-0 flex-1 md:flex"><SearchBar /></div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="flex size-10 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-raised)]"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
          {user && <NotificationBell />}
          {user ? <><Link to="/profile" className="hidden min-h-10 items-center rounded-full px-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-raised)] sm:flex">Profile</Link><button type="button" onClick={async () => { try { await logout(); navigate('/login') } catch (error) { console.error('Logout failed', error) } }} className="hidden min-h-10 rounded-full px-3 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] sm:block">Log out</button></> : <><Link to="/login" className="hidden min-h-10 items-center rounded-full px-3 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] sm:flex">Sign in</Link><Link to="/register" className="ui-button site-cta hidden min-h-10 rounded-full px-5 sm:inline-flex">Get started</Link></>}
        </div>
      </div>
      <div className="site-mobile-search px-4 pb-3 md:hidden"><SearchBar /></div>
    </header>
  )
}
