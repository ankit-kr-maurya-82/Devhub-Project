import { useId, useState } from 'react'
import { contributions, formatDeveloperDate } from '../data/developer'

const levels = ['bg-[var(--surface-raised)]', 'bg-[var(--accent)]/20', 'bg-[var(--accent)]/40', 'bg-[var(--accent)]/70', 'bg-[var(--accent)]']

export default function ContributionOverview() {
  const headingId = useId()
  const [weeks, setWeeks] = useState(12)
  const days = contributions.slice(-weeks * 7)
  const total = days.reduce((sum, day) => sum + day.count, 0)
  const activeDays = days.filter(day => day.count > 0).length
  const range = `${formatDeveloperDate(days[0].date)} – ${formatDeveloperDate(days.at(-1).date)}`

  return (
    <section aria-labelledby={headingId} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 id={headingId} className="text-base font-semibold">Contribution overview</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Your activity over the selected period.</p></div>
        <div role="group" aria-label="Contribution period" className="flex rounded-lg border border-[var(--border)] bg-[var(--page)] p-1">
          {[4, 8, 12].map(period => <button key={period} type="button" aria-pressed={weeks === period} onClick={() => setWeeks(period)} className={`rounded-md px-2.5 py-2 text-xs transition-colors ${weeks === period ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>{period} weeks</button>)}
        </div>
      </div>
      <p role="status" aria-atomic="true" className="mt-6 text-sm text-[var(--muted)]"><strong className="font-semibold text-[var(--text)]">{total} contributions</strong> across {activeDays} active days</p>
      <div className="mt-5 flex gap-3">
        <div aria-hidden="true" className="grid shrink-0 grid-rows-7 items-center gap-1.5 text-xs text-[var(--muted)]">{['M', '', 'W', '', 'F', '', 'S'].map((day, index) => <span key={index}>{day}</span>)}</div>
        <div role="img" aria-label={`${total} contributions across ${activeDays} active days, ${range}. Each column is one week, Monday to Sunday; stronger color indicates more contributions.`} className="grid min-w-0 flex-1 grid-flow-col grid-rows-7 gap-1.5" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
          {days.map(day => <span key={day.date} title={`${formatDeveloperDate(day.date)}: ${day.count} contributions`} className={`h-4 rounded-[3px] sm:h-5 ${levels[day.count === 0 ? 0 : Math.min(4, Math.ceil(day.count / 1.5))]}`} />)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]"><p>{range}</p><div className="flex items-center gap-1.5" aria-hidden="true"><span className="mr-1">Less</span>{levels.map(level => <span key={level} className={`size-2.5 rounded-xs ${level}`} />)}<span className="ml-1">More</span></div></div>
      <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">Sample activity: questions, answers, articles, and solved problems.</p>
    </section>
  )
}
