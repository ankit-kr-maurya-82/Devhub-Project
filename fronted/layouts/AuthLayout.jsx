import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function AuthLayout({ children, title, description, mode = 'login' }) {
  useEffect(() => {
    document.title = `${mode === 'register' ? 'Create account' : 'Log in'} | DevHub`
    window.scrollTo({ top: 0, left: 0 })
  }, [mode])

  return (
    <main className="auth-layout min-h-dvh bg-[var(--page)] px-5 py-6 text-[var(--text)] sm:px-8">
      <header className="auth-header mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" aria-label="DevHub home" className="inline-flex items-center gap-2.5 rounded-lg text-xl font-bold tracking-tight">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--on-primary)]"><Icon name="code" className="size-5" /></span>
          DevHub
        </Link>
        <Link to="/" className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]">← Back to home</Link>
      </header>

      <div className="auth-content mx-auto my-10 grid w-full max-w-6xl items-center gap-10 lg:my-14 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,28rem)] lg:gap-20">
        <section className="auth-promo hidden lg:block" aria-label="Welcome to DevHub">
          <p className="mb-5 text-sm font-medium tracking-wide text-[var(--accent)]">A place to build in public</p>
          <h2>Ideas get better<br />when we share them.</h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--muted)]">Ask the question, write the guide, or join the conversation that helps someone move forward.</p>
          <div className="auth-promo-note mt-10 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name="users" className="size-5" /></span>
            <span className="text-sm text-[var(--muted)]">Learn together. Make something useful.</span>
          </div>
        </section>
        <section aria-labelledby="auth-title" className="auth-card w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <h1 id="auth-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        <p className="mb-6 rounded-lg bg-[var(--surface-raised)] px-3 py-2.5 text-xs leading-5 text-[var(--muted)]">Preview only. {mode === 'register' ? 'Account creation' : 'Sign-in'} is not available yet.</p>
        {children}
        </section>
      </div>
    </main>
  )
}
