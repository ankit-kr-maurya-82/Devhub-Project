import Icon from './Icon'
import { developerStats } from '../data/developer'

const tones = {
  violet: 'bg-violet-400/10 text-violet-300',
  sky: 'bg-sky-400/10 text-sky-300',
  emerald: 'bg-emerald-400/10 text-emerald-300',
  amber: 'bg-amber-400/10 text-amber-300',
  rose: 'bg-rose-400/10 text-rose-300',
}

export default function DeveloperStats() {
  return (
    <dl aria-label="Developer statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {developerStats.map(stat => (
        <div key={stat.key} className="min-w-0 rounded-xl border border-white/10 bg-[#121317] p-5">
          <span className={`mb-5 flex size-10 items-center justify-center rounded-xl ${tones[stat.tone]}`}><Icon name={stat.icon} /></span>
          <dt className="text-xs font-medium text-zinc-400">{stat.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{stat.value.toLocaleString('en-US')}</dd>
          <p className="mt-3 text-xs leading-5 text-zinc-500">{stat.detail}</p>
        </div>
      ))}
    </dl>
  )
}
