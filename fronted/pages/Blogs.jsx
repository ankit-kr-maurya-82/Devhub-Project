import { Link, useSearchParams } from 'react-router-dom'
import BlogCard from '../components/BlogCard'
import Icon from '../components/Icon'
import { useBlogs } from '../hooks/useBlogs'

export default function Blogs() {
  const blogs = useBlogs()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const tag = params.get('tag') || ''
  const normalizedQuery = query.trim().toLowerCase()
  const hasFilters = Boolean(normalizedQuery || tag)

  const update = (key, value) => setParams(current => {
    const next = new URLSearchParams(current)
    if (value) next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })
  const selectTag = value => update('tag', value === tag ? '' : value)
  const visible = blogs.filter(blog =>
    (!tag || blog.tags.includes(tag)) &&
    [blog.title, blog.author, blog.description, ...blog.tags].join(' ').toLowerCase().includes(normalizedQuery)
  ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  const featured = visible.filter(blog => blog.featured)
  const counts = blogs.reduce((result, blog) => {
    blog.tags.forEach(value => { result[value] = (result[value] || 0) + 1 })
    return result
  }, Object.create(null))
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
  const cards = items => (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={tag} onTagSelect={selectTag} />)}
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-[#121317] p-6 sm:p-8">
        <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-5 font-mono text-[150px] text-violet-400/5">&lt;/&gt;</span>
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div><p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-violet-300">IDEAS WORTH SHARING</p><h1>DevHub Blog</h1><p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">Fresh perspectives, practical guides, and lessons from building. Written by developers, for developers.</p></div>
          <Link to="/create-blog" className="flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400"><Icon name="plus" className="size-4" />Write a blog</Link>
        </div>
      </header>

      <div>
        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121317] p-4 focus-within:border-violet-400">
          <Icon name="search" className="size-5 shrink-0 text-violet-400" /><span className="sr-only">Search blogs</span>
          <input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search blogs, authors, or tags…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-3">
          <p role="status" className="min-w-0 break-all text-xs text-zinc-400">{visible.length} {visible.length === 1 ? 'article' : 'articles'}{tag && ` tagged ${tag}`}</p>
          {(query || tag) && <button type="button" onClick={() => setParams({})} className="text-xs text-violet-300 hover:text-violet-200">Clear filters ×</button>}
        </div>
      </div>

      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-9">
          {!hasFilters && featured.length > 0 && (
            <section aria-labelledby="featured-heading">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 id="featured-heading" className="text-xl font-semibold">Featured blogs</h2><span className="font-mono text-[10px] uppercase tracking-wider text-violet-300">Editor’s picks</span></div>
              {cards(featured)}
            </section>
          )}
          <section aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="mb-2 text-xl font-semibold">{hasFilters ? 'Search results' : 'Recent blogs'}</h2>
            <p className="mb-5 text-sm text-zinc-400">{hasFilters ? 'Stories that match your curiosity.' : 'The latest ideas from the community, newest first.'}</p>
            {visible.length ? cards(visible) : (
              <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
                <Icon name="search" className="mx-auto mb-4 size-8 text-violet-400" /><h3 className="font-semibold">No blogs found</h3>
                <p className="mt-2 text-sm text-zinc-400">Try another search or explore a different topic.</p>
                <button type="button" onClick={() => setParams({})} className="mt-4 text-sm text-violet-300">Reset filters</button>
              </div>
            )}
          </section>
        </div>
        <aside className="space-y-5 xl:sticky xl:top-24">
          <section aria-labelledby="popular-tags-heading" className="rounded-xl border border-white/10 bg-[#121317] p-5">
            <h2 id="popular-tags-heading" className="flex items-center gap-2 font-semibold"><Icon name="hash" className="size-4 text-violet-400" />Popular tags</h2>
            <p className="mb-4 mt-2 text-xs leading-5 text-zinc-400">Follow your curiosity. Explore a topic.</p>
            <div className="space-y-1">
              {tags.map(value => (
                <button key={value} type="button" aria-pressed={tag === value} onClick={() => selectTag(value)} className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-xs transition-colors ${tag === value ? 'bg-violet-500/15 text-violet-200' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}>
                  <span className="min-w-0 break-words font-mono">#{value}</span><span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">{counts[value]}<span className="sr-only"> articles</span></span>
                </button>
              ))}
            </div>
            {tag && <button type="button" onClick={() => update('tag', '')} className="mt-4 text-xs text-violet-300">Clear tag ×</button>}
          </section>
          <section className="rounded-xl border border-violet-400/15 bg-violet-500/5 p-5">
            <Icon name="book" className="mb-4 size-6 text-violet-400" /><h2 className="text-sm font-semibold">A little knowledge goes a long way.</h2>
            <p className="mt-2 text-xs leading-6 text-zinc-400">Share a lesson, a discovery, or something you wish you knew sooner.</p>
            <Link to="/create-blog" className="mt-4 inline-block text-sm text-violet-300 hover:text-violet-200">Start writing →</Link>
          </section>
          <p className="px-1 text-xs leading-5 text-zinc-400">Sample community · articles and reactions reset on reload.</p>
        </aside>
      </div>
    </div>
  )
}
