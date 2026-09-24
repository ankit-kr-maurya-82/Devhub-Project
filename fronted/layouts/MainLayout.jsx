import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Icon from '../components/Icon'

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const drawer = useRef(null)
  const menuButton = useRef(null)
  const location = useLocation()
  const closeMenu = () => drawer.current?.close()

  useEffect(() => {
    drawer.current?.close()
  }, [location])

  useEffect(() => {
    const breakpoint = window.matchMedia('(min-width: 1024px)')
    const onResize = () => { if (breakpoint.matches) drawer.current?.close() }
    breakpoint.addEventListener('change', onResize)
    return () => breakpoint.removeEventListener('change', onResize)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [menuOpen])

  return (
    <div className="min-h-dvh bg-[#0c0d10] text-zinc-100">
      <a href="#main-content" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-violet-500 px-4 py-3 focus:translate-y-0">Skip to content</a>
      <Navbar menuOpen={menuOpen} menuButtonRef={menuButton} onMenuToggle={() => { drawer.current?.showModal(); setMenuOpen(true) }} />
      <div className="mx-auto flex max-w-450">
        <aside className="sticky top-18 hidden h-[calc(100dvh-4.5rem)] w-60 shrink-0 overflow-y-auto border-r border-white/10 bg-[#101115] lg:block"><Sidebar /></aside>
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 p-6 outline-none sm:p-10 lg:p-12"><Outlet /></main>
      </div>
      <dialog ref={drawer} id="mobile-navigation" aria-label="DevHub navigation" onClose={() => { setMenuOpen(false); menuButton.current?.focus() }} onClick={(event) => { if (event.target === drawer.current) closeMenu() }} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-80 max-w-[88vw] overflow-y-auto border-r border-white/10 bg-[#101115] text-zinc-100 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-7 py-5"><span className="font-semibold">DevHub navigation</span><button type="button" onClick={closeMenu} aria-label="Close navigation" className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"><Icon name="close" /></button></div>
        <Sidebar compact onNavigate={closeMenu} />
        <div className="flex gap-3 border-t border-white/10 p-5"><Link to="/login" onClick={closeMenu} className="flex-1 rounded-lg border border-white/10 py-3 text-center text-sm">Login</Link><Link to="/register" onClick={closeMenu} className="flex-1 rounded-lg bg-violet-500 py-3 text-center text-sm font-medium">Register</Link></div>
      </dialog>
    </div>
  )
}
