import { useState } from 'react'
import ReportCard from '../../components/admin/ReportCard.jsx'
import { AdminPageHeader, DetailDialog, DetailField, EmptyState, Feedback, StatusBadge, TableToolbar } from '../../components/admin/AdminUI.jsx'
import { formatDate } from '../../components/admin/adminUtils.js'
import { useAdmin } from '../../state/useAdmin.js'

export default function Reports() {
  const { reports, updateReportStatus, removeReportedContent } = useAdmin()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const search = query.trim().toLowerCase()
  const filtered = reports.filter(report => (status === 'all' || report.status === status) && (type === 'all' || report.targetType === type) && `${report.targetTitle} ${report.reporter} ${report.reason} ${report.details}`.toLowerCase().includes(search))
  const selected = reports.find(report => report.id === selectedId)

  function reviewReport(id) {
    const report = reports.find(item => item.id === id)
    if (!report) return
    if (report.status === 'pending') {
      updateReportStatus(id, 'reviewing')
      setFeedback(`Report for “${report.targetTitle}” is under review.`)
    }
    setSelectedId(id)
  }

  function dismissReport(id) {
    const report = reports.find(item => item.id === id)
    if (!report || ['dismissed', 'removed'].includes(report.status)) return
    updateReportStatus(id, 'dismissed')
    setFeedback(`Report for “${report.targetTitle}” was dismissed.`)
  }

  function removeContent(id) {
    const report = reports.find(item => item.id === id)
    if (!report || report.targetType === 'user' || ['dismissed', 'removed'].includes(report.status)) return
    removeReportedContent(id)
    setFeedback(`“${report.targetTitle}” was removed and its open reports were resolved.`)
  }

  return <div className="min-w-0"><AdminPageHeader title="Content reports" description="Review community concerns and take thoughtful moderation actions." count={reports.length} /><Feedback message={feedback} /><TableToolbar query={query} onQueryChange={setQuery} queryLabel="Search reports" status={status} onStatusChange={setStatus} statuses={['pending', 'reviewing', 'dismissed', 'removed']} resultCount={filtered.length}><label className="flex items-center gap-2 text-xs text-[var(--muted)]"><span>Content type</span><select value={type} onChange={event => setType(event.target.value)} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]"><option value="all">All content</option>{['question', 'blog', 'message', 'user'].map(value => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select></label></TableToolbar>{filtered.length ? <div className="grid min-w-0 gap-4 xl:grid-cols-2">{filtered.map(report => <ReportCard key={report.id} report={report} onReview={reviewReport} onDismiss={dismissReport} onRemove={removeContent} />)}</div> : <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]"><EmptyState title="No reports found" /></div>}{selected && <DetailDialog title="Report details" onClose={() => setSelectedId(null)}><div className="flex items-start justify-between gap-3"><h3 className="text-base font-semibold leading-7">{selected.targetTitle}</h3><StatusBadge status={selected.status} /></div><dl className="grid gap-5 sm:grid-cols-2"><DetailField label="Reported by">{selected.reporter}</DetailField><DetailField label="Reported on">{formatDate(selected.date)}</DetailField><DetailField label="Content type"><span className="capitalize">{selected.targetType}</span></DetailField><DetailField label="Reason">{selected.reason}</DetailField></dl><div><h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--subtle)]">Report details</h4><p className="whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm leading-7 text-[var(--muted)]">{selected.details}</p></div></DetailDialog>}</div>
}
