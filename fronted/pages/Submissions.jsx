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
      <header className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-violet-400">Review and improve</p><h1>Submissions</h1><p className="mt-3 text-sm leading-6 text-zinc-400">A mock history of recent attempts across the coding practice library.</p></div><Link to="/coding" className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-3 text-sm font-semibold hover:bg-violet-400"><Icon name="code" className="size-4" />Practice problems</Link></header>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-[#121317] p-4"><label className="text-xs text-zinc-400">Status<select value={status} onChange={event => update('status', event.target.value, 'All statuses')} className="mt-2 block min-h-10 rounded-lg border border-white/10 bg-[#0c0d10] px-3 text-sm text-zinc-200 outline-none focus:border-violet-400">{statuses.map(item => <option key={item}>{item}</option>)}</select></label><label className="text-xs text-zinc-400">Language<select value={language} onChange={event => update('language', event.target.value, 'All languages')} className="mt-2 block min-h-10 rounded-lg border border-white/10 bg-[#0c0d10] px-3 text-sm text-zinc-200 outline-none focus:border-violet-400"><option>All languages</option>{languages.map(item => <option key={item}>{item}</option>)}</select></label><p role="status" className="ml-auto py-2 text-xs text-zinc-400">{visible.length} {visible.length === 1 ? 'submission' : 'submissions'}</p></div>
      <SubmissionTable submissions={visible} />
      <p className="text-xs text-zinc-500">Sample data only · Run Code and Submit do not execute or save code yet.</p>
    </div>
  )
}
