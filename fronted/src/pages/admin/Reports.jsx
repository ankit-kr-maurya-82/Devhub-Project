import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../lib/api.js'

const typeTitle = report => report.target?.title || report.target?.name || report.target?.username || `${report.targetType} unavailable`
      const closed = report => ['resolved', 'dismissed'].includes(report.status)

export default function Reports() {
  const [status, setStatus] = useState('open')
  const [params, setParams] = useSearchParams()
  const targetType = params.get('targetType') || ''
  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)
  const [result, setResult] = useState({ data: [], pagination: null })
  const [loadedKey, setLoadedKey] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState('')
  const key = `${page}|${status}|${targetType}|${refresh}`
  const loading = loadedKey !== key && error?.key !== key

  useEffect(() => {
    let active = true
    api.admin.reports({ page: String(page), limit: '20', ...(status && { status }), ...(targetType && { targetType }) })
      .then(payload => { if (active) { setResult(payload); setLoadedKey(key); setError(null) } })
      .catch(reason => { if (active) setError({ key, message: reason.message || 'Could not load reports.' }) })
    return () => { active = false }
  }, [key, page, status, targetType])

  async function moderate(report, action) {
    if (closed(report) || busy) return
    const confirmText = { hide: 'Hide this content from public views?', restore: 'Restore this content to public views?', suspend: 'Suspend this account?', reactivate: 'Reactivate this account?', dismiss: 'Dismiss this report?', review: 'Mark this report as under review?' }[action]
    if (action !== 'review' && !window.confirm(confirmText)) return
    setBusy(String(report._id))
    try { await api.admin.moderateReport(report._id, { action, ...(report.status === 'processing' && report.moderationAction?.note && { note: report.moderationAction.note }) }); setRefresh(value => value + 1) }
    catch (reason) { setError({ key, message: reason.message || 'Could not apply moderation action.' }) }
    finally { setBusy('') }
  }

  return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Reports and moderation</h1><p className="mt-2 text-sm text-[var(--muted)]">Review reports and apply reversible moderation actions. Each action is recorded in the audit trail.</p></header>
    <div className="flex flex-wrap gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><label className="text-sm">Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }} className="mt-1 block rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2"><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="processing">Processing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option><option value="">All</option></select></label><label className="text-sm">Target type<select value={targetType} onChange={event => { setParams(current => { const next = new URLSearchParams(current); event.target.value ? next.set('targetType', event.target.value) : next.delete('targetType'); return next }); setPage(1) }} className="mt-1 block rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2"><option value="">All targets</option>{['blog', 'question', 'answer', 'comment', 'user'].map(type => <option key={type} value={type}>{type}</option>)}</select></label></div>
    {loading && <p role="status" className="p-6 text-center text-sm text-[var(--muted)]">Loading reports…</p>}
    {!loading && error?.key === key && <p role="alert" className="rounded-xl border border-red-300 p-4 text-sm text-red-700">{error.message} <button onClick={() => setRefresh(value => value + 1)} className="ml-2 underline">Retry</button></p>}
    {!loading && error?.key !== key && <><section className="grid gap-4 xl:grid-cols-2">{result.data.map(report => {
      const target = report.target
      const isHidden = target?.moderationStatus === 'hidden'
      const pendingAction = { report_reviewed: 'review', report_dismissed: 'dismiss', content_hidden: 'hide', content_restored: 'restore', user_suspended: 'suspend', user_reactivated: 'reactivate' }[report.moderationAction?.action]
      return <article key={report._id} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{typeTitle(report)} <span className="font-normal capitalize text-[var(--muted)]">· {report.targetType}</span></h2><span className="rounded-full bg-[var(--surface-raised)] px-3 py-1 text-xs capitalize">{report.status}</span></div><p className="text-sm"><strong>Reason:</strong> {report.reason}</p>{report.details && <p className="whitespace-pre-wrap text-sm text-[var(--muted)]">{report.details}</p>}<p className="text-xs text-[var(--muted)]">Reported by {report.reporter?.username || 'Unknown'} · {new Date(report.createdAt).toLocaleString()}</p>{report.outcome && <p className="text-xs text-[var(--muted)]">Outcome: {report.outcome} · {report.moderatedBy?.username || 'Admin'} · {report.moderatedAt ? new Date(report.moderatedAt).toLocaleString() : ''}</p>}
        {!closed(report) && <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">{report.status === 'processing' ? <><p className="w-full text-sm text-amber-700">A previous action is pending. Retry it to reconcile the report and audit record.</p>{pendingAction && <Action busy={busy === String(report._id)} onClick={() => moderate(report, pendingAction)}>Retry pending action</Action>}</> : <>{report.status === 'open' && <Action busy={busy === String(report._id)} onClick={() => moderate(report, 'review')}>Review</Action>}{report.targetType === 'user' ? <>{target?.isActive && <Action busy={busy === String(report._id)} onClick={() => moderate(report, 'suspend')}>Suspend account</Action>}{target && !target.isActive && <Action busy={busy === String(report._id)} onClick={() => moderate(report, 'reactivate')}>Reactivate account</Action>}</> : target && <Action busy={busy === String(report._id)} onClick={() => moderate(report, isHidden ? 'restore' : 'hide')}>{isHidden ? 'Restore content' : 'Hide content'}</Action>}<Action busy={busy === String(report._id)} onClick={() => moderate(report, 'dismiss')}>Dismiss report</Action></>}</div>}
      </article>
    })}</section>{!result.data.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">No reports in this view.</p>}<nav aria-label="Report pages" className="flex items-center justify-center gap-4"><button disabled={!result.pagination?.hasPrevPage} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Previous</button><span className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span><button disabled={!result.pagination?.hasNextPage} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Next</button></nav></>}
  </div>
}

function Action({ busy, onClick, children }) { return <button disabled={busy} onClick={onClick} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50">{busy ? 'Saving…' : children}</button> }
