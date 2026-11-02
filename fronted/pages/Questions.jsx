import { Link, useSearchParams } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import TagBadge from '../components/TagBadge'
import Icon from '../components/Icon'
import { refreshQuestions, useQuestions, useQuestionStatus } from '../hooks/useQuestions'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

export default function Questions() {
  const questions = useQuestions()
  const { loading, error } = useQuestionStatus()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const tag = params.get('tag') || ''
  const filter = ['Newest', 'Active', 'Unanswered'].includes(params.get('filter')) ? params.get('filter') : 'Newest'
  const update = (key, value) => setParams(current => {
    const next = new URLSearchParams(current)
    if (value) next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })
  const selectTag = value => update('tag', value === tag ? '' : value)
  const visible = questions.filter(question => (!tag || question.tags.includes(tag)) && (filter !== 'Unanswered' || question.answers === 0) && [question.title, question.description, question.username, ...question.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => filter === 'Active' ? b.updatedAt - a.updatedAt : b.createdAt - a.createdAt)
  const topics = [...new Set([...questions.flatMap(question => question.tags), ...(tag ? [tag] : [])])].sort()

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <PageHeader eyebrow="Community knowledge" title="Questions" description="Find a solution, share what you know, or ask the community for help." action={<Link to="/ask-question" className="ui-button"><Icon name="plus" className="size-4" />Ask a question</Link>} />
      <section aria-label="Search and filter questions" className="ui-card space-y-4 p-4 sm:p-5">
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 focus-within:border-[var(--accent)] sm:px-4">
          <Icon name="search" className="size-5 shrink-0 text-[var(--muted)]" />
          <span className="sr-only">Search questions</span>
          <input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search questions…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-[var(--muted)]">Topics</span>
          {topics.map(value => <TagBadge key={value} tag={value} selected={tag === value} onSelect={selectTag} />)}
          {tag && <button type="button" onClick={() => update('tag', '')} className="px-2 py-1 text-xs text-[var(--accent)]">Clear topic</button>}
        </div>
      </section>
      <section className="space-y-4" aria-label="Question list">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="min-w-0 break-words text-sm text-[var(--muted)]">{visible.length} {visible.length === 1 ? 'question' : 'questions'}{tag && ` about ${tag}`}</p>
          <div role="group" className="flex max-w-full flex-wrap gap-1 rounded-lg bg-[var(--surface-raised)] p-1" aria-label="Filter questions">
            {['Newest', 'Active', 'Unanswered'].map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => update('filter', value)} className={`rounded-md px-3 py-2 text-xs font-medium ${filter === value ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>{value === 'Active' ? 'Recently active' : value}</button>)}
          </div>
        </div>
        {loading && !questions.length && <p role="status" aria-live="polite" aria-busy="true" className="ui-card p-5 text-sm text-[var(--muted)]">Loading questions…</p>}
        {error && <ErrorState title="Could not load questions" description={error} onRetry={() => refreshQuestions().catch(() => {})} />}
        {visible.map(question => <QuestionCard key={question.id} question={question} selectedTag={tag} onTagSelect={selectTag} />)}
        {!loading && !error && !visible.length && <EmptyState title={questions.length ? 'No questions match these filters' : 'No questions yet'} description={questions.length ? 'Try a different search or clear the filters to see more questions.' : 'Be the first to ask the community.'} action={<div className="flex flex-wrap justify-center gap-2">{!!questions.length && <button type="button" onClick={() => setParams({})} className="ui-button-secondary">Clear filters</button>}<Link to="/ask-question" className="ui-button">Ask a question</Link></div>} />}
      </section>
      <p className="text-xs leading-5 text-[var(--muted)]">Questions are loaded from the DevHub API.</p>
    </div>
  )
}
