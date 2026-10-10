import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import QuestionCard from '../components/QuestionCard'
import TagBadge from '../components/TagBadge'
import { useQuestions, useQuestionStatus } from '../hooks/useQuestions'

const shortcuts = [
  { to: '/ask-question', icon: 'message', title: 'Ask a question', description: 'Get help with something you’re working on.' },
  { to: '/community', icon: 'users', title: 'Join a conversation', description: 'Meet others and share what you’re learning.' },
]

export default function Home() {
  const questions = useQuestions()
  const { loading, error } = useQuestionStatus()
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const tags = useMemo(() => [...new Set(questions.flatMap(question => question.tags))].sort(), [questions])
  const normalizedQuery = query.trim().toLowerCase()
  const matches = question => (!selectedTag || question.tags.includes(selectedTag)) &&
    [question.title, question.description, question.username, ...question.tags].join(' ').toLowerCase().includes(normalizedQuery)
  const hasFilters = Boolean(normalizedQuery || selectedTag)
  const visibleQuestions = questions.filter(matches).sort((a, b) => b.votes - a.votes).slice(0, hasFilters ? undefined : 3)
  const selectTag = tag => setSelectedTag(current => current === tag ? '' : tag)
  const clearFilters = () => { setQuery(''); setSelectedTag('') }

  return (
    <div className="mx-auto max-w-6xl space-y-9">
      <section aria-labelledby="hero-title" className="ui-card p-6 sm:p-8">
        <p className="mb-2 text-sm font-medium text-[var(--accent)]">Welcome to DevHub</p>
        <h1 id="hero-title">What would you like to learn?</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">Find an answer or get help from the community.</p>
        <div className="mt-6">
          <label htmlFor="developer-search" className="mb-2 block text-sm font-semibold">Search questions</label>
          <div className="flex min-h-13 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--page)] px-4 focus-within:border-[var(--accent)]"><Icon name="search" className="size-5 shrink-0 text-[var(--subtle)]" /><input id="developer-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search questions or topics…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></div>
          {tags.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-[var(--muted)]">Topics</span>{tags.slice(0, 8).map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={selectTag} />)}</div>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--subtle)]"><p role="status">{hasFilters ? `${visibleQuestions.length} matching questions` : 'Questions from the DevHub community.'}</p>{hasFilters && <button type="button" onClick={clearFilters} className="rounded px-2 py-1 font-medium text-[var(--accent)]">Clear filters</button>}</div>
        </div>
      </section>

      <section aria-label="Get started" className="grid gap-3 md:grid-cols-2">
        {shortcuts.map(item => <Link key={item.to} to={item.to} className="ui-card group flex items-start gap-3 p-5 transition-colors hover:border-[var(--accent)]"><span className="rounded-lg bg-[var(--accent-soft)] p-2.5 text-[var(--accent)]"><Icon name={item.icon} /></span><div className="min-w-0"><h2 className="text-sm font-semibold group-hover:text-[var(--accent)]">{item.title} <span aria-hidden="true">→</span></h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.description}</p></div></Link>)}
      </section>

      <section aria-labelledby="questions-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="questions-title" className="text-xl font-semibold tracking-tight">{hasFilters ? 'Matching questions' : 'Recent questions'}</h2><Link to="/questions" className="rounded py-2 text-sm font-medium text-[var(--accent)]">All questions →</Link></div>
        {loading && !questions.length && <p role="status" className="ui-card p-6 text-sm text-[var(--muted)]">Loading questions…</p>}
        {error && <p role="alert" className="ui-card p-6 text-sm text-[var(--danger)]">Could not load questions: {error}</p>}
        <div className="space-y-3">{visibleQuestions.map(question => <QuestionCard key={question.id} question={question} selectedTag={selectedTag} onTagSelect={selectTag} />)}</div>
        {!loading && !error && !visibleQuestions.length && <div className="ui-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No questions have been posted yet.</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-3 rounded text-sm font-medium text-[var(--accent)]">Clear filters</button>}</div>}
      </section>
    </div>
  )
}
