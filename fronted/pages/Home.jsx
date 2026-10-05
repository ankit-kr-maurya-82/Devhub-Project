import { useState } from 'react'
import { useQuestions } from '../hooks/useQuestions'
import { useBlogs } from '../hooks/useBlogs'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import QuestionCard from '../components/QuestionCard'
import BlogCard from '../components/BlogCard'
import TagBadge from '../components/TagBadge'
import { popularTags } from '../data/home'

const shortcuts = [
  { to: '/ask-question', icon: 'message', title: 'Ask a question', description: 'Get help with something you’re working on.' },
  { to: '/coding', icon: 'code', title: 'Practice coding', description: 'Choose a problem and work at your own pace.' },
  { to: '/community', icon: 'users', title: 'Join a conversation', description: 'Meet others and share what you’re learning.' },
]

function SectionHeading({ id, title, to, linkLabel }) {
  return <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id={id} className="text-xl font-semibold tracking-tight">{title}</h2><Link to={to} className="rounded py-2 text-sm font-medium text-[var(--accent)] hover:underline">{linkLabel} <span aria-hidden="true">→</span></Link></div>
}

export default function Home() {
  const blogs = useBlogs()
  const questions = [...useQuestions()].sort((a, b) => b.votes - a.votes)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const matches = item => (!selectedTag || item.tags.includes(selectedTag)) &&
    [item.title, item.description, item.username || item.author, ...item.tags].join(' ').toLowerCase().includes(normalizedQuery)
  const hasFilters = Boolean(normalizedQuery || selectedTag)
  const filteredQuestions = questions.filter(matches).slice(0, hasFilters ? undefined : 3)
  const filteredBlogs = blogs.filter(matches).slice(0, hasFilters ? undefined : 3)
  const selectTag = tag => setSelectedTag(current => current === tag ? '' : tag)
  const clearFilters = () => { setQuery(''); setSelectedTag('') }

  return (
    <div className="mx-auto max-w-6xl space-y-9">
      <section aria-labelledby="hero-title" className="ui-card p-6 sm:p-8">
        <p className="mb-2 text-sm font-medium text-[var(--accent)]">Welcome to DevHub</p>
        <h1 id="hero-title">What would you like to learn?</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">Find an answer, learn something new, or get help from the community.</p>
        <div className="mt-6">
          <label htmlFor="developer-search" className="mb-2 block text-sm font-semibold">Search questions and blogs</label>
          <div className="flex min-h-13 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--page)] px-4 focus-within:border-[var(--accent)]"><Icon name="search" className="size-5 shrink-0 text-[var(--subtle)]" /><input id="developer-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try React, JavaScript, or a question…" aria-describedby="search-help" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></div>
          <div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-[var(--muted)]">Popular topics</span>{popularTags.slice(0, 5).map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={selectTag} />)}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--subtle)]"><p id="search-help" role="status">{hasFilters ? `${filteredQuestions.length} questions · ${filteredBlogs.length} blogs${selectedTag ? ` · ${selectedTag}` : ''}` : 'Search by topic, title, or author.'}</p>{hasFilters && <button type="button" onClick={clearFilters} className="rounded px-2 py-1 font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]">Clear filters</button>}</div>
        </div>
      </section>

      <section aria-label="Get started" className="grid gap-3 md:grid-cols-3">
        {shortcuts.map(item => <Link key={item.to} to={item.to} className="ui-card group flex items-start gap-3 p-5 transition-colors hover:border-[var(--accent)]"><span className="rounded-lg bg-[var(--accent-soft)] p-2.5 text-[var(--accent)]"><Icon name={item.icon} /></span><div className="min-w-0"><h2 className="text-sm font-semibold group-hover:text-[var(--accent)]">{item.title} <span aria-hidden="true">→</span></h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.description}</p></div></Link>)}
      </section>

      <section aria-labelledby="trending-title">
        <SectionHeading id="trending-title" title={hasFilters ? 'Matching questions' : 'Popular questions'} to="/questions" linkLabel="All questions" />
        <div className="space-y-3">{filteredQuestions.map(question => <QuestionCard key={question.id} question={question} selectedTag={selectedTag} onTagSelect={selectTag} />)}</div>
        {!filteredQuestions.length && <div className="ui-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No questions found. Try a different search or topic.</p><button type="button" onClick={clearFilters} className="mt-3 rounded text-sm font-medium text-[var(--accent)]">Clear filters</button></div>}
      </section>

      <section aria-labelledby="blogs-title">
        <SectionHeading id="blogs-title" title={hasFilters ? 'Matching blogs' : 'Latest blogs'} to="/blogs" linkLabel="All blogs" />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filteredBlogs.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={selectedTag} onTagSelect={selectTag} />)}</div>
        {!filteredBlogs.length && <div className="ui-card p-8 text-center"><p className="text-sm text-[var(--muted)]">No blogs found. Try a different search or topic.</p><button type="button" onClick={clearFilters} className="mt-3 rounded text-sm font-medium text-[var(--accent)]">Clear filters</button></div>}
      </section>
      <p className="border-t border-[var(--border)] pt-5 text-xs text-[var(--subtle)]">Preview with sample content. Posts and other changes reset when you refresh.</p>
    </div>
  )
}
