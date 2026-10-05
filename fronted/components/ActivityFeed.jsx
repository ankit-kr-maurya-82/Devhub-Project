import Icon from './Icon'
import { formatDeveloperDate, recentActivity } from '../data/developer'

export default function ActivityFeed({ limit = recentActivity.length }) {
  return (
    <ol className="divide-y divide-[var(--border)]">
      {recentActivity.slice(0, limit).map(item => (
        <li key={item.id} className="flex gap-3 py-5 first:pt-0 last:pb-0 sm:gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name={item.icon} className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs"><p className="text-[var(--muted)]">{item.action}</p><time dateTime={item.date} className="text-[var(--muted)]">{formatDeveloperDate(item.date)}</time></div>
            <p className="mt-1.5 break-words text-sm font-medium leading-6 text-[var(--text)]">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
            {item.reward && <span className="mt-2 inline-block rounded-md bg-[var(--surface-raised)] px-2 py-1 text-xs text-[var(--success)]">{item.reward}</span>}
          </div>
        </li>
      ))}
    </ol>
  )
}
