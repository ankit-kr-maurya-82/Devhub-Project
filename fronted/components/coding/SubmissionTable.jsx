import { Link } from 'react-router-dom'
import { formatSubmissionDate } from '../../data/coding'

const statusStyles = {
  Accepted: 'bg-[var(--surface-raised)] text-[var(--success)]',
  'Wrong Answer': 'bg-[var(--surface-raised)] text-[var(--danger)]',
  'Runtime Error': 'bg-[var(--surface-raised)] text-[var(--warning)]',
  'Time Limit Exceeded': 'bg-[var(--surface-raised)] text-[var(--warning)]',
}

export default function SubmissionTable({ submissions, compact = false }) {
  if (!submissions.length) return <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center"><h3 className="text-sm font-semibold">No stored submissions</h3><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Submission history will appear here when the backend supports coding submissions.</p><Link to="/coding" className="mt-4 inline-block text-sm text-[var(--accent)]">Coding practice status →</Link></div>
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table aria-label="Sample coding submissions" className="w-full min-w-190 border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-raised)] text-xs text-[var(--subtle)]"><tr>{['Problem', 'Status', 'Language', 'Runtime', 'Memory', 'Submitted'].map(column => <th key={column} scope="col" className="px-4 py-3 font-medium">{column}</th>)}</tr></thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">{submissions.slice(0, compact ? 4 : undefined).map(item => <tr key={item.id} className="hover:bg-[var(--surface-raised)]"><td className="px-4 py-4 font-medium text-[var(--text)]"><Link to={`/coding/problem/${item.problemId}`} className="hover:text-[var(--accent)]">{item.problem}</Link></td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${statusStyles[item.status]}`}>{item.status}</span></td><td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">{item.language}</td><td className="px-4 py-4 whitespace-nowrap text-[var(--muted)]">{item.runtime}</td><td className="px-4 py-4 whitespace-nowrap text-[var(--muted)]">{item.memory}</td><td className="px-4 py-4 whitespace-nowrap text-xs text-[var(--muted)]"><time dateTime={item.submittedAt}>{formatSubmissionDate(item.submittedAt)}</time></td></tr>)}</tbody>
      </table>
    </div>
  )
}
