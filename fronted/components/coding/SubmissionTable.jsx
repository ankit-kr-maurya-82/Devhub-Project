import { Link } from 'react-router-dom'
import { formatSubmissionDate } from '../../data/coding.js'

const statusStyles = {
  unavailable: 'bg-[var(--surface-raised)] text-[var(--warning)]',
  pending: 'bg-[var(--surface-raised)] text-[var(--muted)]',
  accepted: 'bg-[var(--surface-raised)] text-[var(--success)]',
  wrong_answer: 'bg-[var(--surface-raised)] text-[var(--danger)]',
  runtime_error: 'bg-[var(--surface-raised)] text-[var(--warning)]',
  compile_error: 'bg-[var(--surface-raised)] text-[var(--warning)]',
  time_limit_exceeded: 'bg-[var(--surface-raised)] text-[var(--warning)]',
}
const label = value => value.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())

export default function SubmissionTable({ submissions = [] }) {
  if (!submissions.length) return <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center"><h2 className="text-sm font-semibold">No submissions yet</h2><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Submissions will appear here after you submit a solution.</p><Link to="/coding" className="mt-4 inline-block text-sm text-[var(--accent)]">Browse problems</Link></div>
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table aria-label="Your coding submissions" className="w-full min-w-150 border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-raised)] text-xs text-[var(--subtle)]"><tr>{['Problem', 'Verdict', 'Language', 'Submitted'].map(column => <th key={column} scope="col" className="px-4 py-3 font-medium">{column}</th>)}</tr></thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">{submissions.map(item => <tr key={item._id} className="hover:bg-[var(--surface-raised)]"><td className="px-4 py-4 font-medium text-[var(--text)]">{item.problem?.slug ? <Link to={`/coding/problem/${encodeURIComponent(item.problem.slug)}`} className="hover:text-[var(--accent)]">{item.problem.title}</Link> : 'Problem unavailable'}</td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${statusStyles[item.verdict] || statusStyles.unavailable}`}>{label(item.verdict)}</span>{item.executionMetadata?.executed === false && <p className="mt-1 text-xs text-[var(--muted)]">Not executed</p>}</td><td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">{item.language}</td><td className="px-4 py-4 whitespace-nowrap text-xs text-[var(--muted)]"><time dateTime={item.createdAt}>{formatSubmissionDate(item.createdAt)}</time></td></tr>)}</tbody>
      </table>
    </div>
  )
}
