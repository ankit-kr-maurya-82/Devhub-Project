import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge.jsx'

export default function ProblemCard({ problem }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3"><h2 className="break-words text-base font-semibold leading-6"><Link to={`/coding/problem/${encodeURIComponent(problem.slug)}`} className="hover:text-[var(--accent)]">{problem.title}</Link></h2><DifficultyBadge difficulty={problem.difficulty} /></div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{problem.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">{problem.topics.map(topic => <Link key={topic} to={`/coding?topic=${encodeURIComponent(topic)}`} className="max-w-full break-words rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-xs text-[var(--muted)]">{topic}</Link>)}</div>
        </div>
        <Link to={`/coding/problem/${encodeURIComponent(problem.slug)}`} aria-label={`Open ${problem.title}`} className="inline-flex min-h-10 items-center rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]">Open problem →</Link>
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">Languages: {problem.supportedLanguages.join(', ')}</p>
    </article>
  )
}
