import { useEffect, useRef } from 'react'
import Icon from '../../../components/Icon.jsx'
import { formatDate } from './adminUtils.js'

export function StatusBadge({ status }) {
  const color = ['active', 'published'].includes(status) ? 'var(--success)' : ['suspended', 'pending', 'reviewing', 'hidden'].includes(status) ? 'var(--warning)' : ['deleted', 'removed'].includes(status) ? 'var(--danger)' : 'var(--muted)'
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1 text-[10px] font-semibold capitalize" style={{ color }}><span className="size-1 rounded-full bg-current" />{status}</span>
}

export function AdminPageHeader({ eyebrow = 'Administration', title, description, count }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p><h1 className="text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p></div>{count !== undefined && <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">{count.toLocaleString()} records</span>}</div>
}

export function TableToolbar({ query, onQueryChange, queryLabel, status, onStatusChange, statuses, resultCount, children }) {
  return <div className="mb-4 flex flex-wrap items-center gap-3"><label className="relative min-w-0 flex-1 basis-56"><Icon name="search" className="pointer-events-none absolute left-3 top-3 size-4 text-[var(--subtle)]" /><span className="sr-only">{queryLabel}</span><input value={query} onChange={event => onQueryChange(event.target.value)} placeholder={queryLabel} type="search" className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--subtle)]" /></label><label className="flex items-center gap-2 text-xs text-[var(--muted)]"><span>Status</span><select value={status} onChange={event => onStatusChange(event.target.value)} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]"><option value="all">All statuses</option>{statuses.map(value => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select></label>{children}<p aria-live="polite" className="w-full text-xs text-[var(--subtle)]">{resultCount} matching {resultCount === 1 ? 'record' : 'records'}</p></div>
}

export function Feedback({ message }) {
  return <div role="status" aria-live="polite" className={message ? 'mb-4 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-xs text-[var(--text)]' : 'sr-only'}>{message && <Icon name="check" className="size-4 shrink-0 text-[var(--success)]" />}{message}</div>
}

export function EmptyState({ title = 'No matching records', description = 'Try another search or choose a different status.' }) {
  return <div className="px-6 py-14 text-center"><Icon name="search" className="mx-auto mb-3 size-7 text-[var(--subtle)]" /><p className="text-sm font-medium text-[var(--text)]">{title}</p><p className="mt-2 text-xs text-[var(--muted)]">{description}</p></div>
}

export function DetailDialog({ title, onClose, children }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])
  return <dialog ref={dialogRef} aria-label={title} onClose={event => { if (!event.currentTarget.open) onClose() }} onClick={event => {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close()
  }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text)] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"><div className="sticky top-0 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4"><h2 className="text-base font-semibold">{title}</h2><button autoFocus type="button" onClick={() => dialogRef.current.close()} aria-label="Close details" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)]"><Icon name="close" className="size-4" /></button></div><div className="space-y-5 p-5">{children}</div></dialog>
}

export function DetailField({ label, children }) {
  return <div><dt className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--subtle)]">{label}</dt><dd className="m-0 break-words text-sm text-[var(--text)]">{children}</dd></div>
}

export function ContentDetails({ item, type, onClose }) {
  return <DetailDialog title={type === 'question' ? 'Question details' : 'Blog details'} onClose={onClose}><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold leading-7">{item.title}</h3><StatusBadge status={item.status} /></div><dl className="grid grid-cols-2 gap-4"><DetailField label="Author">{item.author}</DetailField><DetailField label="Published">{formatDate(item.date)}</DetailField><DetailField label={type === 'question' ? 'Votes / Answers' : 'Likes / Comments'}>{type === 'question' ? `${item.votes} votes · ${item.answers} answers` : `${item.likes} likes · ${item.comments} comments`}</DetailField><DetailField label={type === 'question' ? 'Tags' : 'Category'}>{type === 'question' ? item.tags.join(', ') : item.category}</DetailField></dl><div className="whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm leading-7 text-[var(--muted)]">{item.body}</div></DetailDialog>
}
