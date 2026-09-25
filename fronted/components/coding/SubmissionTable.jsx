import { Link } from 'react-router-dom'
import { formatSubmissionDate } from '../../data/coding'

const statusStyles = {
  Accepted: 'bg-emerald-400/10 text-emerald-300',
  'Wrong Answer': 'bg-rose-400/10 text-rose-300',
  'Runtime Error': 'bg-orange-400/10 text-orange-300',
  'Time Limit Exceeded': 'bg-amber-400/10 text-amber-300',
}

export default function SubmissionTable({ submissions, compact = false }) {
  if (!submissions.length) return <div className="rounded-xl border border-dashed border-white/10 p-8 text-center"><h3 className="text-sm font-semibold">No submissions yet</h3><p className="mt-2 text-xs leading-5 text-zinc-400">Open a problem and submit a solution to start your history.</p><Link to="/coding" className="mt-4 inline-block text-sm text-violet-300">Browse problems →</Link></div>
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-190 border-collapse text-left text-sm">
        <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-zinc-500"><tr>{['Problem', 'Status', 'Language', 'Runtime', 'Memory', 'Submitted At'].map(column => <th key={column} scope="col" className="px-4 py-3 font-medium">{column}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/5 bg-[#121317]">{submissions.slice(0, compact ? 4 : undefined).map(item => <tr key={item.id} className="hover:bg-white/[0.02]"><td className="px-4 py-4 font-medium text-zinc-200"><Link to={`/coding/problem/${item.problemId}`} className="hover:text-violet-300">{item.problem}</Link></td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] ${statusStyles[item.status]}`}>{item.status}</span></td><td className="px-4 py-4 font-mono text-xs text-zinc-400">{item.language}</td><td className="px-4 py-4 whitespace-nowrap text-zinc-400">{item.runtime}</td><td className="px-4 py-4 whitespace-nowrap text-zinc-400">{item.memory}</td><td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-400"><time dateTime={item.submittedAt}>{formatSubmissionDate(item.submittedAt)}</time></td></tr>)}</tbody>
      </table>
    </div>
  )
}
