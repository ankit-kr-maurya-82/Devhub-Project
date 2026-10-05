import { Link } from 'react-router-dom'
import SubmissionTable from './SubmissionTable'
import { codingStats, mockSubmissions } from '../../data/coding'

export default function CodingDashboardSection() {
  const metrics = [
    ['Solved', codingStats.total],
    ['Easy', codingStats.easy],
    ['Medium', codingStats.medium],
    ['Hard', codingStats.hard],
    ['Practice streak', `${codingStats.streak} days`],
  ]
  return (
    <section aria-labelledby="dashboard-coding" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="dashboard-coding" className="text-lg font-semibold">Coding practice</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Choose a problem and practice writing a solution.</p></div>
        <Link to="/coding" className="inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]">Browse problems</Link>
      </div>
      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">{metrics.map(([label, value]) => <div key={label} className="rounded-lg bg-[var(--surface-raised)] p-3"><dt className="text-xs leading-5 text-[var(--muted)]">{label}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd></div>)}</dl>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold">Recent submissions</h3><Link to="/submissions" className="text-sm font-medium text-[var(--accent)]">View all →</Link></div>
      <div className="mt-4"><SubmissionTable submissions={mockSubmissions} compact /></div>
      <p className="mt-4 text-xs leading-5 text-[var(--subtle)]">Sample progress and results. Code is not executed in this preview.</p>
    </section>
  )
}
