import { useEffect, useState } from 'react'
import api from '../../lib/api.js'
import { AdminPageHeader } from '../../components/admin/AdminUI.jsx'

const labels = { questions: 'Questions', answers: 'Answers', comments: 'Comments' }
const contentText = item => item.title || item.content || item.description || ''

export default function ManageContent({ type }) {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ data: [], pagination: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.admin.content(type, { page: String(page), limit: '20' })
      .then(payload => { if (active) { setResult(payload); setError('') } })
      .catch(reason => { if (active) setError(reason.message || `Could not load ${type}.`) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [type, page])

  useEffect(() => setPage(1), [type])

  return <div className="min-w-0 space-y-5">
    <AdminPageHeader title={`Manage ${labels[type]?.toLowerCase() || 'content'}`} description={`Browse all community ${type} and see who posted each item.`} count={result.pagination?.total || 0} />
    {loading && <p role="status" className="p-6 text-center text-sm text-[var(--muted)]">Loading {type}…</p>}
    {!loading && error && <p role="alert" className="rounded-xl border border-[var(--danger)] p-4 text-sm text-[var(--danger)]">{error}</p>}
    {!loading && !error && <>
      <div className="space-y-3">{result.data.map(item => <article key={item._id} className="ui-card space-y-3 p-4">
        <header className="flex flex-wrap items-start justify-between gap-3"><h2 className="break-words font-semibold">{contentText(item) || 'Untitled'}</h2><span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs capitalize text-[var(--muted)]">{item.moderationStatus || (item.isSolved ? 'solved' : 'visible')}</span></header>
        {item.title && item.description && <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">{item.description}</p>}
        {item.content && <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted)]">{item.content}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]"><span>By {item.author?.name || item.author?.username || 'Unknown user'}{item.author?.username ? ` (@${item.author.username})` : ''}</span>{item.author?.email && <span>{item.author.email}</span>}{item.question?.title && <span>Question: {item.question.title}</span>}{item.targetType && <span>On {item.targetType} · {item.targetId}</span>}<span>{new Date(item.createdAt).toLocaleString()}</span></div>
        {item.tags?.length > 0 && <p className="text-xs text-[var(--muted)]">Tags: {item.tags.join(', ')}</p>}
      </article>)}{!result.data.length && <p className="ui-card p-8 text-center text-sm text-[var(--muted)]">No {type} yet.</p>}</div>
      <nav aria-label={`${type} pages`} className="flex flex-wrap items-center justify-center gap-3"><button type="button" disabled={!result.pagination?.hasPrevPage} onClick={() => setPage(current => current - 1)} className="ui-button-secondary disabled:opacity-40">Previous</button><span aria-live="polite" className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span><button type="button" disabled={!result.pagination?.hasNextPage} onClick={() => setPage(current => current + 1)} className="ui-button-secondary disabled:opacity-40">Next</button></nav>
    </>}
  </div>
}
