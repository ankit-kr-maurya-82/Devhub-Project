import Icon from './Icon'
import { achievements } from '../data/developer'

export default function Achievements() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {achievements.map(badge => (
        <li key={badge.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-400/5 text-amber-300"><Icon name={badge.icon} /></span>
          <div className="min-w-0"><h3 className="text-sm font-medium text-zinc-200">{badge.name}</h3><p className="mt-1 text-xs leading-5 text-zinc-400">{badge.description}</p><p className="mt-1.5 text-[10px] text-amber-200/70">Earned {badge.earned}</p></div>
        </li>
      ))}
    </ul>
  )
}
