import { Link } from 'react-router-dom'
import Icon from '../Icon'
import { codingStats } from '../../data/coding'

export default function CodingProfileStats() {
  return (
    <section aria-labelledby="profile-coding" className="rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-[#121317] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3"><div><h2 id="profile-coding" className="text-base font-semibold">Coding statistics</h2><p className="mt-1 text-xs leading-5 text-zinc-400">Practice progress at a glance.</p></div><Icon name="code" className="size-5 text-violet-400" /></div>
      <div className="mt-5 flex items-end gap-3"><strong className="text-4xl font-semibold tracking-tight text-violet-200">{codingStats.total}</strong><span className="pb-1 text-xs text-zinc-400">problems solved</span></div>
      <dl className="mt-5 grid grid-cols-3 gap-2">{[['Easy', codingStats.easy, 'text-emerald-300'], ['Medium', codingStats.medium, 'text-amber-300'], ['Hard', codingStats.hard, 'text-rose-300']].map(([label, value, tone]) => <div key={label} className="rounded-lg bg-[#0c0d10]/70 p-3"><dt className="text-[10px] text-zinc-500">{label}</dt><dd className={`mt-1 text-lg font-semibold ${tone}`}>{value}</dd></div>)}</dl>
      <dl className="mt-5 space-y-3 border-t border-white/5 pt-4 text-xs"><div className="flex items-center justify-between gap-3"><dt className="text-zinc-500">Favorite language</dt><dd className="font-medium text-zinc-200">{codingStats.favoriteLanguage}</dd></div><div className="flex items-center justify-between gap-3"><dt className="text-zinc-500">Current streak</dt><dd className="font-medium text-zinc-200">{codingStats.streak} days</dd></div></dl>
      <Link to="/coding" className="mt-5 flex items-center justify-center rounded-lg border border-violet-400/20 py-2.5 text-xs font-medium text-violet-300 hover:bg-violet-400/10">Continue practice →</Link>
    </section>
  )
}
