import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import SearchBar from './SearchBar'
import NotificationBell from '../src/components/notifications/NotificationBell.jsx'
import { useMockSession } from '../src/state/useMockSession.js'
import Avatar from './Avatar'

export default function Navbar({ menuOpen, onMenuToggle, menuButtonRef, showWorkspaceMenu = false }) {
  const { theme, toggleTheme, user, logout } = useMockSession()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex min-h-18 max-w-450 items-center gap-2 px-3 sm:gap-6 sm:px-6">
        <button ref={menuButtonRef} type="button" onClick={onMenuToggle} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className={`flex size-11 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-raised)] ${showWorkspaceMenu ? '' : 'lg:hidden'}`}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        <Link to="/" aria-label="DevHub home" className={`flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight sm:gap-2.5 sm:text-xl ${showWorkspaceMenu ? '' : 'lg:w-48'}`}><span className="flex size-8 items-center justify-center rounded-xl bg-[var(--primary)] text-white sm:size-9"><Icon name="code" className="size-5" /></span>DevHub</Link>
        <div className="hidden min-w-32 max-w-sm flex-1 md:flex"><SearchBar /></div>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="flex size-11 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-raised)]"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
          {user && <NotificationBell />}
          {user ? <><Link to="/profile" aria-label="Open your profile" className="hidden min-h-11 max-w-40 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-raised)] sm:flex"><Avatar name={user.name || user.username || 'My profile'} src={user.avatar} size="sm" /><span className="max-w-28 truncate">{user.username || user.name || 'My profile'}</span></Link><button type="button" onClick={async () => { try { await logout(); navigate('/login') } catch (error) { console.error('Logout failed', error) } }} className="hidden min-h-11 rounded-lg px-3 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-raised)] sm:block">Log out</button></> : <><Link to="/login" className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-raised)] sm:flex">Log in</Link><Link to="/register" className="ui-button hidden sm:inline-flex">Create account</Link></>}
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><SearchBar /></div>
    </header>
  )
}
