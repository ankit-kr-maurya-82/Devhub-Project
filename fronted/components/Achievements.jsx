import Icon from './Icon'
import { achievements } from '../data/developer'

export default function Achievements() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {achievements.map(badge => (
        <li key={badge.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent)]"><Icon name={badge.icon} /></span>
          <div className="min-w-0"><h3 className="text-sm font-medium text-[var(--text)]">{badge.name}</h3><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{badge.description}</p><p className="mt-1.5 text-xs text-[var(--muted)]">Earned {badge.earned}</p></div>
        </li>
      ))}
    </ul>
  )
}
