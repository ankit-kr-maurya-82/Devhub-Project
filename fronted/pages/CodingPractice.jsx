import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProblemCard from '../components/coding/ProblemCard.jsx'
import api from '../src/lib/api.js'

export default function CodingPractice() {
  const [params, setParams] = useSearchParams()
  const page = params.get('page') || '1'
  const difficulty = params.get('difficulty') || ''
  const topic = params.get('topic') || ''
  const [topicInput, setTopicInput] = useState(topic)
  const [result, setResult] = useState({ data: [], pagination: null })
  const [resultKey, setResultKey] = useState('')
  const [error, setError] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const requestKey = `${page}|${difficulty}|${topic}|${refresh}`
  const loading = resultKey !== requestKey && error?.key !== requestKey

  useEffect(() => {
    let active = true
    api.coding.problems({ page, limit: '12', ...(difficulty && { difficulty }), ...(topic && { topic }) })
      .then(payload => { if (active) { setResult({ data: payload.data, pagination: payload.pagination }); setResultKey(requestKey); setError(null) } })
      .catch(reason => { if (active) setError({ key: requestKey, message: reason.message || 'Could not load problems.' }) })
    return () => { active = false }
  }, [page, difficulty, topic, requestKey])

  function update(next) {
    setParams(current => {
      const updated = new URLSearchParams(current)
      Object.entries(next).forEach(([key, value]) => value ? updated.set(key, value) : updated.delete(key))
      if (!Object.hasOwn(next, 'page')) updated.delete('page')
      return updated
    })
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-[var(--accent)]">Practice</p><h1 className="mt-2 text-3xl font-bold">Coding problems</h1><p className="mt-2 text-sm text-[var(--muted)]">Solve community-curated programming challenges.</p></div><Link to="/submissions" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium">My submissions</Link></header>
      <section aria-label="Problem filters" className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="text-sm font-medium">Difficulty<select value={difficulty} onChange={event => update({ difficulty: event.target.value })} className="mt-1 block min-w-36 rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2"><option value="">All difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <form className="flex min-w-56 flex-1 gap-2" onSubmit={event => { event.preventDefault(); update({ topic: topicInput.trim() }) }}><label className="min-w-0 flex-1 text-sm font-medium">Topic<input value={topicInput} onChange={event => setTopicInput(event.target.value)} maxLength="40" placeholder="e.g. arrays" className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label><button className="self-end rounded-lg border border-[var(--border)] px-4 py-2">Filter</button></form>
        {(difficulty || topic) && <button type="button" onClick={() => { setTopicInput(''); setParams({}) }} className="rounded-lg px-3 py-2 text-sm text-[var(--accent)]">Clear</button>}
      </section>
      {loading && <p role="status" className="py-8 text-center text-sm text-[var(--muted)]">Loading problems…</p>}
      {!loading && error?.key === requestKey && <p role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{error.message} <button onClick={() => setRefresh(value => value + 1)} className="ml-2 underline">Retry</button></p>}
      {!loading && error?.key !== requestKey && result.data.length === 0 && <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center"><h2 className="font-semibold">No published problems found</h2><p className="mt-2 text-sm text-[var(--muted)]">Try clearing the current filters.</p></div>}
      {!loading && error?.key !== requestKey && result.data.length > 0 && <>
        <section aria-label="Published problems" className="space-y-4">{result.data.map(problem => <ProblemCard key={problem._id} problem={problem} />)}</section>
        <nav aria-label="Problem pages" className="flex items-center justify-center gap-4"><button disabled={!result.pagination?.hasPrevPage} onClick={() => update({ page: String(Number(page) - 1) })} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Previous</button><span className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span><button disabled={!result.pagination?.hasNextPage} onClick={() => update({ page: String(Number(page) + 1) })} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Next</button></nav>
      </>}
    </main>
  )
}
