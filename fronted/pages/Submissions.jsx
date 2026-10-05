import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import SubmissionTable from '../components/coding/SubmissionTable'
import { languages, mockSubmissions } from '../data/coding'

const statuses = ['All statuses', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded']

export default function Submissions() {
  const [params, setParams] = useSearchParams()
  const status = statuses.includes(params.get('status')) ? params.get('status') : 'All statuses'
  const language = languages.includes(params.get('language')) ? params.get('language') : 'All languages'
  const visible = mockSubmissions.filter(item => (status === 'All statuses' || item.status === status) && (language === 'All languages' || item.language === language))
  const update = (key, value, defaultValue) => setParams(current => { const next = new URLSearchParams(current); if (value === defaultValue) next.delete(key); else next.set(key, value); return next }, { replace: true })
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5"><div><h1>Submissions</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Browse sample coding attempts and filter by result or language.</p></div><Link to="/coding" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"><Icon name="code" className="size-4" />Practice problems</Link></header>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><label className="text-xs text-[var(--muted)]">Status<select value={status} onChange={event => update('status', event.target.value, 'All statuses')} className="mt-2 block min-h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]">{statuses.map(item => <option key={item}>{item}</option>)}</select></label><label className="text-xs text-[var(--muted)]">Language<select value={language} onChange={event => update('language', event.target.value, 'All languages')} className="mt-2 block min-h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"><option>All languages</option>{languages.map(item => <option key={item}>{item}</option>)}</select></label><p role="status" className="ml-auto py-2 text-xs text-[var(--muted)]">{visible.length} {visible.length === 1 ? 'submission' : 'submissions'}</p></div>
      <SubmissionTable submissions={visible} />
      <p className="text-xs text-[var(--subtle)]">Preview only. These are sample submissions. Code is not executed or saved.</p>
    </div>
  )
}
