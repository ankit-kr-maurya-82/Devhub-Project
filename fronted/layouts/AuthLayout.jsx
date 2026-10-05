import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function AuthLayout({ children, title, description, mode = 'login' }) {
  useEffect(() => {
    document.title = `${mode === 'register' ? 'Create account' : 'Log in'} | DevHub`
    window.scrollTo({ top: 0, left: 0 })
  }, [mode])

  return (
    <main className="min-h-dvh bg-[var(--page)] px-5 py-6 text-[var(--text)] sm:px-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link to="/" aria-label="DevHub home" className="inline-flex items-center gap-2.5 rounded-lg text-xl font-bold tracking-tight">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white"><Icon name="code" className="size-5" /></span>
          DevHub
        </Link>
        <Link to="/" className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]">← Back to home</Link>
      </header>

      <section aria-labelledby="auth-title" className="mx-auto my-10 w-full max-w-112 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:my-14 sm:p-8">
        <div className="mb-7">
          <h1 id="auth-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        <p className="mb-6 rounded-lg bg-[var(--surface-raised)] px-3 py-2.5 text-xs leading-5 text-[var(--muted)]">Preview only. {mode === 'register' ? 'Account creation' : 'Sign-in'} is not available yet.</p>
        {children}
      </section>
    </main>
  )
}
