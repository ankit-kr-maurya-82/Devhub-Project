import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SubmissionTable from '../components/coding/SubmissionTable.jsx'
import api from '../src/lib/api.js'

export default function Submissions() {
  const [params, setParams] = useSearchParams()
  const page = params.get('page') || '1'
  const [result, setResult] = useState({ data: [], pagination: null })
  const [loadedPage, setLoadedPage] = useState('')
  const [error, setError] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const requestKey = `${page}|${refresh}`
  const loading = loadedPage !== requestKey && error?.key !== requestKey

  useEffect(() => {
    let active = true
    api.coding.submissions({ page, limit: '20' })
      .then(payload => { if (active) { setResult({ data: payload.data, pagination: payload.pagination }); setLoadedPage(requestKey); setError(null) } })
      .catch(reason => { if (active) setError({ key: requestKey, message: reason.message || 'Could not load submissions.' }) })
    return () => { active = false }
  }, [page, requestKey])

  return <main className="mx-auto w-full max-w-6xl space-y-6"><header><Link to="/coding" className="text-sm text-[var(--muted)]">← Coding problems</Link><h1 className="mt-3 text-3xl font-bold">My submissions</h1><p className="mt-2 text-sm text-[var(--muted)]">Your stored submissions are private to your account.</p></header>
    {loading && <p role="status" className="py-8 text-center text-sm text-[var(--muted)]">Loading submissions…</p>}
    {!loading && error?.key === requestKey && <p role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{error.message} <button onClick={() => setRefresh(value => value + 1)} className="ml-2 underline">Retry</button></p>}
    {!loading && error?.key !== requestKey && <><SubmissionTable submissions={result.data} /><nav aria-label="Submission pages" className="flex items-center justify-center gap-4"><button disabled={!result.pagination?.hasPrevPage} onClick={() => setParams({ page: String(Number(page) - 1) })} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Previous</button><span className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span><button disabled={!result.pagination?.hasNextPage} onClick={() => setParams({ page: String(Number(page) + 1) })} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Next</button></nav></>}
  </main>
}
