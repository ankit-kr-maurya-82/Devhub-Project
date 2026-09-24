import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import QuestionCard from '../components/QuestionCard'
import BlogCard from '../components/BlogCard'
import TagBadge from '../components/TagBadge'
import { questions, blogs, popularTags, communityStats } from '../data/home'

function SectionHeading({ id, title, description, to, linkLabel }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><h2 id={id} className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2><p className="mt-1 text-sm text-zinc-500">{description}</p></div>
      {to && <Link to={to} className="text-xs font-medium text-violet-300 hover:text-violet-200">{linkLabel} <span aria-hidden="true">→</span></Link>}
    </div>
  )
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const matches = item => (!selectedTag || item.tags.includes(selectedTag)) &&
    [item.title, item.description, item.username || item.author, ...item.tags].join(' ').toLowerCase().includes(normalizedQuery)
  const filteredQuestions = questions.filter(matches)
  const filteredBlogs = blogs.filter(matches)
  const selectTag = tag => setSelectedTag(current => current === tag ? '' : tag)
  const clearFilters = () => { setQuery(''); setSelectedTag('') }
  const hasFilters = Boolean(normalizedQuery || selectedTag)

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 via-[#14141c] to-[#111216] p-6 sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-6 top-6 hidden rotate-12 font-mono text-[140px] font-bold text-violet-400/5 sm:block">&lt;/&gt;</div>
        <div className="relative">
          <p className="mb-5 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-violet-300"><span className="size-1.5 rounded-full bg-violet-400" />A COMMUNITY FOR CURIOUS DEVELOPERS</p>
          <h1 id="hero-title" className="text-4xl leading-tight sm:text-5xl">Learn. Build. <span className="text-violet-400">Share.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">Your next breakthrough starts here. Find answers, share your knowledge, and grow alongside developers who love building as much as you do.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link to="/questions" className="flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold transition-colors hover:bg-violet-400"><Icon name="message" className="size-4" />Explore Questions</Link><Link to="/register" className="rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium transition-colors hover:bg-white/10">Join DevHub <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section aria-label="Developer search">
        <label htmlFor="developer-search" className="mb-3 block text-sm font-medium text-zinc-300">What are you working on today?</label>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121317] px-4 py-3 focus-within:border-violet-400/60 sm:px-5"><Icon name="search" className="size-5 shrink-0 text-violet-400" /><input id="developer-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search questions, blogs, tags, or developers…" aria-describedby="search-help" className="min-w-0 flex-1 bg-transparent py-1 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" /></div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500"><p id="search-help" role="status">{hasFilters ? `${filteredQuestions.length} questions · ${filteredBlogs.length} blogs${selectedTag ? ` · ${selectedTag}` : ''}` : 'Find your next answer, idea, or inspiration.'}</p>{hasFilters && <button type="button" onClick={clearFilters} className="rounded px-2 py-1 text-violet-300 hover:bg-violet-400/10">Clear filters ×</button>}</div>
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_250px]">
        <section aria-labelledby="trending-title" className="min-w-0">
          <SectionHeading id="trending-title" title="Trending Questions" description="Good questions. Great conversations." to="/questions" linkLabel="View all questions" />
          <div className="space-y-4">{filteredQuestions.map(question => <QuestionCard key={question.id} question={question} selectedTag={selectedTag} onTagSelect={selectTag} />)}</div>
          {!filteredQuestions.length && <p className="rounded-xl border border-dashed border-zinc-700 p-8 text-sm text-zinc-400">No questions match your search. Try another topic or clear the filters.</p>}
        </section>
        <aside className="space-y-6">
          <section aria-labelledby="tags-title" className="rounded-xl border border-white/10 bg-[#121317] p-5">
            <h2 id="tags-title" className="flex items-center gap-2 text-sm font-semibold"><Icon name="hash" className="size-4 text-violet-400" />Popular Tags</h2><p className="mb-5 mt-2 text-xs leading-5 text-zinc-500">Find your corner of the developer world.</p>
            <div className="flex flex-wrap gap-2">{popularTags.map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={selectTag} />)}</div>
          </section>
          <section aria-labelledby="community-title" className="rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-[#121317] p-5">
            <h2 id="community-title" className="text-sm font-semibold">Built by the community</h2><p className="mt-2 text-xs leading-5 text-zinc-500">A little curiosity goes a long way.</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">{communityStats.map(stat => <div key={stat.label}><Icon name={stat.icon} className="mb-2 size-4 text-violet-400" /><dt className="text-xs text-zinc-500">{stat.label}</dt><dd className="mt-1 text-xl font-semibold tracking-tight text-zinc-200">{stat.value}</dd></div>)}</dl>
            <p className="mt-5 border-t border-white/5 pt-4 font-mono text-[10px] text-zinc-500">Preview · sample community data</p>
          </section>
        </aside>
      </div>

      <section aria-labelledby="blogs-title">
        <SectionHeading id="blogs-title" title="Recent Technical Blogs" description="Fresh perspectives from developers, for developers." to="/blogs" linkLabel="View all blogs" />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filteredBlogs.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={selectedTag} onTagSelect={selectTag} />)}</div>
        {!filteredBlogs.length && <p className="rounded-xl border border-dashed border-zinc-700 p-8 text-sm text-zinc-400">No blogs match your search. Try another topic or clear the filters.</p>}
      </section>
      <p className="border-t border-white/5 pt-6 text-center text-xs text-zinc-600">A place to ask better questions and build better things. <span className="text-violet-400/70">That’s DevHub.</span></p>
    </div>
  )
}
