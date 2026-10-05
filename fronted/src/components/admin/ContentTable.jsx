import { EmptyState, StatusBadge } from './AdminUI.jsx'
import { dangerButtonClass, formatDate, secondaryButtonClass } from './adminUtils.js'

function ContentActions({ item, onView, onStatusChange }) {
  const nextAction = item.status === 'published' ? 'Hide' : 'Restore'
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onView(item.id)} aria-label={`View ${item.title}`} className={`${secondaryButtonClass} min-h-10`}>View</button>
      <button type="button" onClick={() => onStatusChange(item.id, item.status === 'published' ? 'hidden' : 'published')} aria-label={`${nextAction} ${item.title}`} className={`${secondaryButtonClass} min-h-10`}>{nextAction}</button>
      <button type="button" disabled={item.status === 'deleted'} onClick={() => onStatusChange(item.id, 'deleted')} aria-label={`Delete ${item.title}`} className={`${dangerButtonClass} min-h-10`}>Delete</button>
    </div>
  )
}

export default function ContentTable({ items, type, onView, onStatusChange }) {
  const isQuestion = type === 'question'
  const tags = item => isQuestion ? item.tags : [item.category]
  const engagement = item => isQuestion ? `${item.votes} votes · ${item.answers} answers` : `${item.likes} likes · ${item.comments} comments`

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <ul className="divide-y divide-[var(--border)] xl:hidden">
        {items.map(item => (
          <li key={item.id} className="space-y-3 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onView(item.id)} className="min-w-0 text-left text-base font-semibold leading-6 text-[var(--text)] hover:text-[var(--accent)]">{item.title}</button>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-sm text-[var(--muted)]">{item.author} · {formatDate(item.date)}</p>
            <div className="flex flex-wrap gap-2">{tags(item).map(tag => <span key={tag} className="rounded-md bg-[var(--surface-raised)] px-2 py-1 text-xs text-[var(--muted)]">{tag}</span>)}</div>
            <p className="text-sm text-[var(--muted)]">{engagement(item)}</p>
            <ContentActions item={item} onView={onView} onStatusChange={onStatusChange} />
          </li>
        ))}
      </ul>
      <div className="hidden max-w-full overflow-x-auto xl:block">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-raised)] text-xs text-[var(--muted)]"><tr>{[isQuestion ? 'Question' : 'Article', 'Author', 'Activity', 'Published', 'Status', 'Actions'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-[var(--border)]">{items.map(item => (
            <tr key={item.id} className="hover:bg-[var(--surface-raised)]">
              <td className="min-w-60 max-w-80 px-4 py-4"><button type="button" onClick={() => onView(item.id)} className="text-left font-medium leading-6 text-[var(--text)] hover:text-[var(--accent)]">{item.title}</button><div className="mt-2 flex flex-wrap gap-1.5">{tags(item).map(tag => <span key={tag} className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs text-[var(--accent)]">{tag}</span>)}</div></td>
              <td className="whitespace-nowrap px-4 py-4 text-[var(--muted)]">{item.author}</td>
              <td className="px-4 py-4 text-[var(--muted)]">{engagement(item)}</td>
              <td className="whitespace-nowrap px-4 py-4 text-[var(--muted)]">{formatDate(item.date)}</td>
              <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-4"><ContentActions item={item} onView={onView} onStatusChange={onStatusChange} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {items.length === 0 && <EmptyState title={`No ${isQuestion ? 'questions' : 'articles'} found`} />}
    </div>
  )
}
