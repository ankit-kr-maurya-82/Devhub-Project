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
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
      <header className="ui-page-header"><div className="min-w-0"><p className="text-sm font-medium text-[var(--accent)]">Practice</p><h1 className="mt-1">Coding problems</h1><p className="mt-2 text-sm text-[var(--muted)]">Solve community-curated programming challenges.</p></div><Link to="/submissions" className="ui-button-secondary">My submissions</Link></header>
      <section aria-label="Problem filters" className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
        <label className="min-w-36 flex-1 text-sm font-medium sm:flex-none">Difficulty<select value={difficulty} onChange={event => update({ difficulty: event.target.value })} className="ui-input mt-1"><option value="">All difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <form className="flex min-w-0 flex-1 flex-wrap items-end gap-2 sm:min-w-56" onSubmit={event => { event.preventDefault(); update({ topic: topicInput.trim() }) }}><label className="min-w-40 flex-1 text-sm font-medium">Topic<input value={topicInput} onChange={event => setTopicInput(event.target.value)} maxLength="40" placeholder="e.g. arrays" className="ui-input mt-1" /></label><button className="ui-button-secondary">Filter</button></form>
        {(difficulty || topic) && <button type="button" onClick={() => { setTopicInput(''); setParams({}) }} className="ui-button-secondary">Clear filters</button>}
      </section>
      {loading && <p role="status" aria-live="polite" aria-busy="true" className="ui-card p-8 text-center text-sm text-[var(--muted)]">Loading problems…</p>}
      {!loading && error?.key === requestKey && <div role="alert" className="ui-card flex flex-wrap items-center justify-between gap-3 border-[var(--danger)] p-4 text-sm text-[var(--danger)]"><span>{error.message}</span><button type="button" onClick={() => setRefresh(value => value + 1)} className="ui-button-secondary">Retry</button></div>}
      {!loading && error?.key !== requestKey && result.data.length === 0 && <div className="ui-card p-7 text-center sm:p-8"><h2 className="font-semibold">{difficulty || topic ? 'No matching problems' : 'No published problems yet'}</h2><p className="mt-2 text-sm text-[var(--muted)]">{difficulty || topic ? 'Try adjusting or clearing the current filters.' : 'Published problems will appear here.'}</p>{(difficulty || topic) && <button type="button" onClick={() => { setTopicInput(''); setParams({}) }} className="ui-button-secondary mt-4">Clear filters</button>}</div>}
      {!loading && error?.key !== requestKey && result.data.length > 0 && <>
        <section aria-label="Published problems" className="space-y-4">{result.data.map(problem => <ProblemCard key={problem._id} problem={problem} />)}</section>
        <nav aria-label="Problem pages" className="flex flex-wrap items-center justify-center gap-3"><button disabled={!result.pagination?.hasPrevPage} onClick={() => update({ page: String(Number(page) - 1) })} className="ui-button-secondary">Previous</button><span aria-live="polite" className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span><button disabled={!result.pagination?.hasNextPage} onClick={() => update({ page: String(Number(page) + 1) })} className="ui-button-secondary">Next</button></nav>
      </>}
    </div>
  )
}
