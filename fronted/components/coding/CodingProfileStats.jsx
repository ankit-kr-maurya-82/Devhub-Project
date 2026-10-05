import { Link } from 'react-router-dom'
import Icon from '../Icon'
import { codingStats } from '../../data/coding'

export default function CodingProfileStats() {
  return (
    <section aria-labelledby="profile-coding" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3"><div><h2 id="profile-coding" className="text-base font-semibold">Coding statistics</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Sample practice progress.</p></div><Icon name="code" className="size-5 text-[var(--accent)]" /></div>
      <div className="mt-5 flex items-end gap-3"><strong className="text-4xl font-semibold tracking-tight text-[var(--accent)]">{codingStats.total}</strong><span className="pb-1 text-xs text-[var(--muted)]">problems solved</span></div>
      <dl className="mt-5 grid grid-cols-3 gap-2">{[['Easy', codingStats.easy, 'text-[var(--success)]'], ['Medium', codingStats.medium, 'text-[var(--warning)]'], ['Hard', codingStats.hard, 'text-[var(--danger)]']].map(([label, value, tone]) => <div key={label} className="rounded-lg bg-[var(--surface-raised)] p-3"><dt className="text-xs text-[var(--subtle)]">{label}</dt><dd className={`mt-1 text-lg font-semibold ${tone}`}>{value}</dd></div>)}</dl>
      <dl className="mt-5 space-y-3 border-t border-[var(--border)] pt-4 text-xs"><div className="flex items-center justify-between gap-3"><dt className="text-[var(--subtle)]">Favorite language</dt><dd className="font-medium text-[var(--text)]">{codingStats.favoriteLanguage}</dd></div><div className="flex items-center justify-between gap-3"><dt className="text-[var(--subtle)]">Current streak</dt><dd className="font-medium text-[var(--text)]">{codingStats.streak} days</dd></div></dl>
      <Link to="/coding" className="mt-5 flex items-center justify-center rounded-lg border border-[var(--border)] py-2.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]">Browse practice problems →</Link>
    </section>
  )
}
