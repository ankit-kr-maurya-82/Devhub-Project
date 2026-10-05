import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge'

export default function ProblemCard({ problem }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="break-words text-base font-semibold leading-6"><Link to={`/coding/problem/${problem.id}`} className="hover:text-[var(--accent)]">{problem.title}</Link></h3>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{problem.tags.map(tag => <span key={tag} className="max-w-full break-words rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-xs text-[var(--muted)]">{tag}</span>)}</div>
        </div>
        <Link to={`/coding/problem/${problem.id}`} aria-label={`Open ${problem.title}`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]">Open problem →</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
        <span className={problem.solved ? 'font-medium text-[var(--success)]' : ''}>{problem.solved ? '✓ Solved' : 'Not solved yet'}</span>
        <span>{problem.acceptance}% acceptance</span>
        <span>{problem.submissions.toLocaleString('en-US')} submissions</span>
      </div>
    </article>
  )
}
