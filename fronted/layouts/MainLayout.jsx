import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Icon from '../components/Icon'
import PageBoundary from '../components/PageBoundary'
import { navigation } from '../components/navigation'
import { useMockSession } from '../src/state/useMockSession.js'

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useMockSession()
  const location = useLocation()
  const drawer = useRef(null)
  const menuButton = useRef(null)
  const isCommunity = /^\/community\/?$/.test(location.pathname)
  const isAdmin = /^\/admin(?:\/|$)/.test(location.pathname)
  const hasOwnSidebar = isCommunity || isAdmin
  const closeMenu = () => drawer.current?.close()
  const trapDrawerFocus = event => {
    if (event.key !== 'Tab') return
    const controls = [...event.currentTarget.querySelectorAll('a[href], button:not([disabled])')]
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }


  useEffect(() => {
    drawer.current?.close()
  }, [location])

  useEffect(() => {
    const page = navigation.find(item => item.to === (location.pathname.replace(/\/+$/, '') || '/'))
    const adminTitles = { '/admin/users': 'Manage Users', '/admin/questions': 'Manage Questions', '/admin/blogs': 'Manage Blogs', '/admin/reports': 'Reports' }
    const title = adminTitles[location.pathname.replace(/\/+$/, '')] || page?.label || (location.pathname.startsWith('/questions/') ? 'Question' : location.pathname.startsWith('/blogs/') ? 'Blog' : location.pathname.startsWith('/coding/problem/') ? 'Coding Problem' : location.pathname === '/submissions' ? 'Submissions' : location.pathname === '/create-blog' ? 'Create a blog' : 'Page not found')
    document.title = `${title} | DevHub`
    if (!location.hash) window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (hasOwnSidebar) return
    const breakpoint = window.matchMedia('(min-width: 1024px)')
    const onResize = () => { if (breakpoint.matches) drawer.current?.close() }
    breakpoint.addEventListener('change', onResize)
    return () => breakpoint.removeEventListener('change', onResize)
  }, [hasOwnSidebar])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [menuOpen])

  return (
    <div className="min-h-dvh bg-[var(--page)] text-[var(--text)]">
      <a href="#main-content" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-[var(--primary)] px-4 py-3 text-white focus:translate-y-0">Skip to content</a>
      <Navbar showWorkspaceMenu={hasOwnSidebar} menuOpen={menuOpen} menuButtonRef={menuButton} onMenuToggle={() => { drawer.current?.showModal(); setMenuOpen(true) }} />
      <div className="mx-auto flex max-w-450">
        {!hasOwnSidebar && <aside className="sticky top-18 hidden h-[calc(100dvh-4.5rem)] w-60 shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] lg:block"><Sidebar /></aside>}
        <main id="main-content" tabIndex={-1} className={`min-w-0 flex-1 outline-none ${isCommunity ? 'p-2 sm:p-4 lg:p-6' : isAdmin ? 'p-0' : 'p-4 sm:p-8 lg:p-10'}`}><PageBoundary key={location.pathname}><Outlet /></PageBoundary></main>
      </div>
      <dialog ref={drawer} id="mobile-navigation" aria-label="DevHub navigation" onClose={() => { setMenuOpen(false); if (menuButton.current?.offsetParent) menuButton.current.focus() }} onKeyDown={trapDrawerFocus} onClick={event => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu()
      }} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-80 max-w-[88vw] overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-7 py-5"><span className="font-semibold">DevHub navigation</span><button type="button" onClick={closeMenu} aria-label="Close navigation" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)]"><Icon name="close" /></button></div>
        <Sidebar compact onNavigate={closeMenu} />
        <div className="flex gap-3 border-t border-[var(--border)] p-5">{user ? <><Link to="/profile" onClick={closeMenu} className="ui-button-secondary flex-1">My profile</Link><button type="button" onClick={async () => { try { await logout(); closeMenu() } catch { /* Keep the session visible if logout fails. */ } }} className="ui-button flex-1">Log out</button></> : <><Link to="/login" onClick={closeMenu} className="ui-button-secondary flex-1">Log in</Link><Link to="/register" onClick={closeMenu} className="ui-button flex-1">Create account</Link></>}</div>
      </dialog>
    </div>
  )
}
