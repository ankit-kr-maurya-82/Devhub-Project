import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import ProblemCard from '../components/coding/ProblemCard'
import ProblemFilter from '../components/coding/ProblemFilter'
import { codingProblems, codingStats } from '../data/coding'

const validFilters = ['All', 'Easy', 'Medium', 'Hard', 'Solved', 'Unsolved']

export default function CodingPractice() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const requestedFilter = params.get('filter') || 'All'
  const filter = validFilters.includes(requestedFilter) ? requestedFilter : 'All'
  const normalizedQuery = query.trim().toLowerCase()
  const visible = useMemo(() => codingProblems.filter(problem => {
    const matchesQuery = [problem.title, ...problem.tags].join(' ').toLowerCase().includes(normalizedQuery)
    const matchesFilter = filter === 'All' || problem.difficulty === filter || (filter === 'Solved' ? problem.solved : filter === 'Unsolved' ? !problem.solved : false)
    return matchesQuery && matchesFilter
  }), [filter, normalizedQuery])

  const update = (key, value) => setParams(current => {
    const next = new URLSearchParams(current)
    if (value && value !== 'All') next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><h1>Coding practice</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">Choose a problem and write a solution at your own pace.</p></div>
        <Link to="/submissions" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-raised)]"><Icon name="clock" className="size-4" />View submissions</Link>
      </header>
      <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">Practice preview: you can edit code and explore sample results. Code is not executed, and progress below is sample data.</p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Solved', codingStats.total], ['Easy', codingStats.easy], ['Medium', codingStats.medium], ['Hard', codingStats.hard]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{value}</dd></div>)}
      </dl>

      <section aria-labelledby="problem-library" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="problem-library" className="text-xl font-semibold">Choose a problem</h2><p className="mt-1 text-sm text-[var(--muted)]">Start with an easy problem, or filter by difficulty.</p></div><p role="status" className="text-xs text-[var(--muted)]">{visible.length} {visible.length === 1 ? 'problem' : 'problems'}</p></div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 focus-within:border-[var(--accent)]"><Icon name="search" className="size-4 shrink-0 text-[var(--accent)]" /><span className="sr-only">Search by problem title or tag</span><input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search by title or tag…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[var(--subtle)]" /></label>
          <ProblemFilter value={filter} onChange={value => update('filter', value)} />
        </div>
        <div className="space-y-4">{visible.map(problem => <ProblemCard key={problem.id} problem={problem} />)}</div>
        {!visible.length && <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center"><Icon name="search" className="mx-auto mb-4 size-8 text-[var(--subtle)]" /><h2 className="text-base font-semibold">No problems found</h2><p className="mt-2 text-sm text-[var(--muted)]">Try another title, tag, or difficulty.</p><button type="button" onClick={() => setParams({})} className="mt-5 rounded text-sm font-medium text-[var(--accent)]">Reset filters</button></div>}
      </section>
    </div>
  )
}
