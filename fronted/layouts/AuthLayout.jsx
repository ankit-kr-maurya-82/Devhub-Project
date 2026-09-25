import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

function Brand() {
  return (
    <Link to="/" aria-label="DevHub home" className="inline-flex w-fit items-center gap-2.5 rounded-lg text-xl font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#101115]">
      <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/20"><Icon name="code" className="size-5" /></span>
      <span>Dev<span className="text-violet-400">Hub</span></span>
    </Link>
  )
}

export default function AuthLayout({ children, title, description, mode = 'login' }) {
  useEffect(() => {
    document.title = `${mode === 'register' ? 'Register' : 'Login'} | DevHub`
    window.scrollTo({ top: 0, left: 0 })
  }, [mode])

  return (
    <main className="min-h-dvh bg-[#0c0d10] text-zinc-100 lg:grid lg:grid-cols-2">
      <aside aria-label="About DevHub" className="relative hidden flex-col overflow-hidden border-r border-white/10 bg-[#101115] px-10 py-10 lg:flex xl:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/4 size-120 rounded-full bg-violet-600/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-56 -right-24 size-120 rounded-full border border-violet-400/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 size-120 rounded-full border border-violet-400/10" />

        <div className="relative"><Brand /></div>

        <div className="relative mx-auto flex w-full max-w-112 flex-1 flex-col justify-center py-16">
          <div className="mb-7 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            <span className="size-1.5 rounded-full bg-violet-400" />
            Built for curious minds
          </div>
          <h2 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">Learn. Build.<br /><span className="text-violet-400">Share.</span></h2>
          <p className="mt-6 max-w-96 text-base leading-7 text-zinc-400">A home for developers to exchange ideas, share what they know, and build something that matters.</p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d10]/70 shadow-2xl shadow-black/10" aria-hidden="true">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-3.5">
              <span className="size-2 rounded-full bg-zinc-600" />
              <span className="size-2 rounded-full bg-zinc-600" />
              <span className="size-2 rounded-full bg-zinc-600" />
              <span className="ml-auto font-mono text-xs text-zinc-500">your-next-chapter.js</span>
            </div>
            <div className="space-y-2 px-5 py-6 font-mono text-[13px] leading-6 xl:text-sm">
              <div><span className="mr-5 text-zinc-600">01</span><span className="text-violet-300">const</span> developer = {'{'}</div>
              <div><span className="mr-5 text-zinc-600">02</span><span className="pl-4 text-zinc-400">mindset:</span> <span className="text-emerald-300">'always learning'</span>,</div>
              <div><span className="mr-5 text-zinc-600">03</span><span className="pl-4 text-zinc-400">nextStep:</span> <span className="text-emerald-300">'build together'</span></div>
              <div><span className="mr-5 text-zinc-600">04</span>{'}'}</div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-2"><Icon name="book" className="size-4 text-violet-400" />Explore ideas</span>
            <span className="inline-flex items-center gap-2"><Icon name="code" className="size-4 text-violet-400" />Share your work</span>
            <span className="inline-flex items-center gap-2"><Icon name="message" className="size-4 text-violet-400" />Join the conversation</span>
          </div>
        </div>

        <p className="relative text-xs text-zinc-500">Good ideas grow together.</p>
      </aside>

      <section aria-labelledby="auth-title" className="flex min-w-0 flex-col px-6 py-6 sm:px-10 lg:px-12 lg:py-10 xl:px-20">
        <header className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="lg:hidden"><Brand /></div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-md py-2 text-xs text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:text-sm">
            <span aria-hidden="true">←</span> Back to home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="w-full max-w-110">
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">{mode === 'register' ? 'Your next chapter starts here' : 'Your community awaits'}</p>
              <h1 id="auth-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
            {children}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500">A little curiosity. A lot of possibility.</p>
      </section>
    </main>
  )
}
