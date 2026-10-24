import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge.jsx'

export default function ProblemCard({ problem }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5"><h2 className="min-w-0 break-words text-base font-semibold leading-6"><Link to={`/coding/problem/${encodeURIComponent(problem.slug)}`} className="rounded-sm hover:text-[var(--accent)]">{problem.title}</Link></h2><DifficultyBadge difficulty={problem.difficulty} /></div>
          <p className="mt-2 break-words text-sm leading-6 text-[var(--muted)] line-clamp-2">{problem.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">{problem.topics.map(topic => <Link key={topic} to={`/coding?topic=${encodeURIComponent(topic)}`} className="max-w-full break-words rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]">{topic}</Link>)}</div>
        </div>
        <Link to={`/coding/problem/${encodeURIComponent(problem.slug)}`} aria-label={`Open ${problem.title}`} className="ui-button-secondary shrink-0 text-[var(--accent)]">Open problem <span aria-hidden="true">→</span></Link>
      </div>
      <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">Languages: <span className="break-words">{problem.supportedLanguages.join(', ')}</span></p>
    </article>
  )
}
