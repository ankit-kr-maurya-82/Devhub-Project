import { developerStats } from '../data/developer'

export default function DeveloperStats() {
  return (
    <dl aria-label="Developer statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {developerStats.map(stat => (
        <div key={stat.key} className="ui-card min-w-0 p-5">
          <dt className="text-sm font-medium text-[var(--muted)]">{stat.label}</dt>
          <dd className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text)]">{stat.value.toLocaleString('en-US')}</dd>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{stat.detail}</p>
        </div>
      ))}
    </dl>
  )
}
