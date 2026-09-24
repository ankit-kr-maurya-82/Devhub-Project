import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import SearchBar from './SearchBar'
import { navigation } from './navigation'

export default function Navbar({ menuOpen, onMenuToggle, menuButtonRef }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#101115]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-450 items-center gap-4 px-4 sm:px-6">
        <button ref={menuButtonRef} type="button" onClick={onMenuToggle} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 lg:hidden"><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        <Link to="/" aria-label="DevHub home" className="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight lg:w-51"><span className="flex size-9 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/15"><Icon name="code" className="size-5" /></span>Dev<span className="-ml-2 text-violet-400">Hub</span></Link>
        <div className="hidden min-w-36 max-w-72 flex-1 md:flex"><SearchBar /></div>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
          {navigation.filter((item) => item.primary).map(({ label, to }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-violet-400/10 text-violet-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>{label}</NavLink>)}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 sm:block">Login</Link>
          <Link to="/register" className="rounded-lg bg-violet-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-400 sm:px-4">Register</Link>
          <Link to="/profile" aria-label="Your profile" className="hidden size-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-violet-400 sm:flex"><Icon name="user" /></Link>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><SearchBar /></div>
    </header>
  )
}
