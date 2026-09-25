import { Link } from 'react-router-dom'
import SubmissionTable from './SubmissionTable'
import { codingStats, mockSubmissions } from '../../data/coding'

export default function CodingDashboardSection() {
  const metrics = [
    ['Problems Solved', codingStats.total],
    ['Easy Solved', codingStats.easy],
    ['Medium Solved', codingStats.medium],
    ['Hard Solved', codingStats.hard],
    ['Current Streak', `${codingStats.streak} days`],
  ]
  return (
    <section aria-labelledby="dashboard-coding" className="rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 via-[#121317] to-[#121317] p-5 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-violet-400">Coding practice</p><h2 id="dashboard-coding" className="text-lg font-semibold">Keep your problem-solving streak alive.</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Track your progress and pick up where you left off.</p></div><div className="flex flex-wrap gap-3"><Link to="/submissions" className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5">All submissions</Link><Link to="/coding" className="rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold hover:bg-violet-400">Solve a problem</Link></div></div>
      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-white/5 bg-[#0c0d10]/60 p-4"><dt className="text-[11px] leading-4 text-zinc-400">{label}</dt><dd className="mt-2 text-xl font-semibold tabular-nums text-zinc-100">{value}</dd></div>)}</dl>
      <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Recent submissions</h3><span className="text-[11px] text-zinc-500">Sample results</span></div>
      <div className="mt-4"><SubmissionTable submissions={mockSubmissions} compact /></div>
    </section>
  )
}
