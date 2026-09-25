import { Link, useSearchParams } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import TagBadge from '../components/TagBadge'
import Icon from '../components/Icon'
import { popularTags } from '../data/home'
import { useQuestions } from '../hooks/useQuestions'

export default function Questions() {
  const questions = useQuestions()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const tag = params.get('tag') || ''
  const filter = ['Newest', 'Active', 'Unanswered'].includes(params.get('filter')) ? params.get('filter') : 'Newest'
  const update = (key, value) => setParams(current => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); return next }, { replace: true })
  const visible = questions.filter(question => (!tag || question.tags.includes(tag)) && (filter !== 'Unanswered' || question.answers === 0) && [question.title, question.description, question.username, ...question.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => filter === 'Active' ? b.updatedAt - a.updatedAt : b.createdAt - a.createdAt)

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 font-mono text-xs tracking-widest text-violet-400">THE DEVELOPER COLLECTIVE</p><h1>Questions</h1><p className="mt-2 text-sm text-zinc-400">Get unstuck. Share what you know. Build something better.</p></div><Link to="/ask-question" className="flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400"><Icon name="plus" className="size-4" />Ask Question</Link></div>
      <p className="text-xs text-zinc-500">Frontend demo · posts, answers, and votes reset when you reload.</p>
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_240px]">
        <section className="min-w-0 space-y-5" aria-label="Question list">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121317] p-4 focus-within:border-violet-400"><Icon name="search" className="size-5 shrink-0 text-violet-400" /><span className="sr-only">Search questions</span><input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search questions, tags, or developers…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="min-w-0 break-all text-xs text-zinc-500">{visible.length} questions{tag && ` tagged ${tag}`}</p><div role="group" className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-[#121317] p-1" aria-label="Filter questions">{['Newest', 'Active', 'Unanswered'].map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => update('filter', value)} className={`rounded-md px-3 py-2 text-xs ${filter === value ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-400 hover:text-white'}`}>{value}</button>)}</div></div>
          {visible.map(question => <QuestionCard key={question.id} question={question} selectedTag={tag} onTagSelect={value => update('tag', value === tag ? '' : value)} />)}
          {!visible.length && <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center"><h2 className="font-semibold">No questions found</h2><p className="mt-2 text-sm text-zinc-400">Try another topic or reset the filters.</p><button type="button" onClick={() => setParams({})} className="mt-4 text-sm text-violet-300">Reset filters</button></div>}
        </section>
        <aside className="rounded-xl border border-white/10 bg-[#121317] p-5"><h2 className="font-semibold">Popular tags</h2><p className="mb-5 mt-2 text-xs leading-5 text-zinc-500">Explore the topics you care about.</p><div className="flex flex-wrap gap-2">{[...new Set([...popularTags, ...(tag ? [tag] : [])])].map(value => <TagBadge key={value} tag={value} selected={tag === value} onSelect={value => update('tag', tag === value ? '' : value)} />)}</div>{tag && <button type="button" onClick={() => update('tag', '')} className="mt-5 text-xs text-violet-300">Clear tag ×</button>}</aside>
      </div>
    </div>
  )
}
