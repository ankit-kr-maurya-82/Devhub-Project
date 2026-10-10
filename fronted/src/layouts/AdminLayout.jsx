import { Link, Outlet } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import { useMockSession } from '../state/useMockSession.js'

export default function AdminLayout() {
  const { role } = useMockSession()

  if (role !== 'admin') {
    return (
      <section className="mx-auto my-8 max-w-xl space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <Icon name="shield" className="size-10 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="text-sm leading-6 text-[var(--muted)]">Sign in with an administrator account to open this area.</p>
        <Link to="/" className="inline-block rounded-lg text-sm font-medium text-[var(--accent)]">Back to DevHub</Link>
      </section>
    )
  }

  return (
    <div className="min-w-0 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside aria-label="Admin navigation" className="sticky top-18 hidden h-[calc(100dvh-4.5rem)] overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] lg:block"><AdminSidebar /></aside>
      <div className="min-w-0">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] lg:hidden"><AdminSidebar compact /></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 sm:px-6">
          <p className="text-sm leading-5 text-[var(--muted)]"><span className="font-medium text-[var(--text)]">Admin workspace unavailable</span> · Administrative actions require backend APIs.</p>
        </div>
        <div className="min-w-0 p-4 sm:p-6 xl:p-8"><Outlet /></div>
      </div>
    </div>
  )
}
