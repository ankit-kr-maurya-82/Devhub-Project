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
      <header className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 via-[#14141c] to-[#121317] p-6 sm:p-8">
        <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-8 font-mono text-[160px] font-bold text-violet-400/5">{'{}'}</span>
        <div className="relative flex flex-wrap items-end justify-between gap-6"><div><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Practice with purpose</p><h1>Coding Practice</h1><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">Build fluency one problem at a time. Explore patterns, test an approach, and keep your momentum visible.</p></div><Link to="/submissions" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-violet-400/40"><Icon name="clock" className="size-4" />View submissions</Link></div>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Solved', codingStats.total], ['Easy', codingStats.easy], ['Medium', codingStats.medium], ['Hard', codingStats.hard]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-[#121317] p-4"><dt className="text-xs text-zinc-400">{label}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{value}</dd></div>)}
      </dl>

      <section aria-labelledby="problem-library" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="problem-library" className="text-xl font-semibold">Problem library</h2><p className="mt-1 text-sm text-zinc-400">Six curated problems to explore in this frontend preview.</p></div><p role="status" className="text-xs text-zinc-400">{visible.length} {visible.length === 1 ? 'problem' : 'problems'}</p></div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#121317] px-4 focus-within:border-violet-400"><Icon name="search" className="size-4 shrink-0 text-violet-400" /><span className="sr-only">Search by problem title or tag</span><input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search by title or tag…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500" /></label>
          <ProblemFilter value={filter} onChange={value => update('filter', value)} />
        </div>
        <div className="space-y-4">{visible.map(problem => <ProblemCard key={problem.id} problem={problem} />)}</div>
        {!visible.length && <div className="rounded-xl border border-dashed border-white/10 p-10 text-center"><Icon name="search" className="mx-auto mb-4 size-8 text-zinc-600" /><h2 className="text-base font-semibold">No problems found</h2><p className="mt-2 text-sm text-zinc-400">Try another title, tag, or difficulty.</p><button type="button" onClick={() => setParams({})} className="mt-5 rounded text-sm font-medium text-violet-300">Reset filters</button></div>}
      </section>
      <p className="text-xs text-zinc-500">Frontend preview · code is never executed and progress uses mock data.</p>
    </div>
  )
}
