import Icon from './Icon'
import { formatDeveloperDate, recentActivity } from '../data/developer'

export default function ActivityFeed({ limit = recentActivity.length }) {
  return (
    <ol className="divide-y divide-white/5">
      {recentActivity.slice(0, limit).map(item => (
        <li key={item.id} className="flex gap-3 py-5 first:pt-0 last:pb-0 sm:gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/5 text-violet-300"><Icon name={item.icon} className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs"><p className="text-zinc-400">{item.action}</p><time dateTime={item.date} className="text-zinc-500">{formatDeveloperDate(item.date)}</time></div>
            <p className="mt-1.5 break-words text-sm font-medium leading-6 text-zinc-200">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-400">{item.detail}</p>
            {item.reward && <span className="mt-2 inline-block rounded-md bg-emerald-400/5 px-2 py-1 text-[11px] text-emerald-300">{item.reward}</span>}
          </div>
        </li>
      ))}
    </ol>
  )
}
