import { Link, useSearchParams } from 'react-router-dom'
import BlogCard from '../components/BlogCard'
import Icon from '../components/Icon'
import TagBadge from '../components/TagBadge'
import { useBlogs } from '../hooks/useBlogs'

export default function Blogs() {
  const blogs = useBlogs()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const tag = params.get('tag') || ''
  const normalizedQuery = query.trim().toLowerCase()

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
  const counts = blogs.reduce((result, blog) => {
    blog.tags.forEach(value => { result[value] = (result[value] || 0) + 1 })
    return result
  }, Object.create(null))
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><h1>Blogs</h1><p className="mt-2 text-sm text-[var(--muted)]">Read guides and ideas shared by the community.</p></div>
        <Link to="/create-blog" className="ui-button"><Icon name="plus" className="size-4" />Write a blog</Link>
      </header>
      <section aria-label="Search and filter blogs" className="ui-card space-y-4 p-4 sm:p-5">
        <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--page)] px-4 py-3 focus-within:border-[var(--accent)]">
          <Icon name="search" className="size-5 shrink-0 text-[var(--muted)]" /><span className="sr-only">Search blogs</span>
          <input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search blogs…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-[var(--muted)]">Topics</span>
          {tags.map(value => <TagBadge key={value} tag={value} selected={tag === value} onSelect={selectTag} />)}
          {tag && <button type="button" onClick={() => update('tag', '')} className="px-2 py-1 text-xs text-[var(--accent)]">Clear topic</button>}
        </div>
      </section>
      <section aria-label="Blog list" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="min-w-0 break-words text-sm text-[var(--muted)]">{visible.length} {visible.length === 1 ? 'article' : 'articles'}{tag && ` about ${tag}`}</p>
          {(query || tag) ? <button type="button" onClick={() => setParams({})} className="text-sm text-[var(--accent)]">Clear filters</button> : <p className="text-xs text-[var(--muted)]">Newest first</p>}
        </div>
        {visible.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {visible.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={tag} onTagSelect={selectTag} />)}
          </div>
        ) : (
          <div className="ui-card p-8 text-center">
            <h2 className="font-semibold">No blogs found</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Try a different search or clear the filters.</p>
            <button type="button" onClick={() => setParams({})} className="ui-button-secondary mt-4">Clear filters</button>
          </div>
        )}
      </section>
      <p className="text-xs leading-5 text-[var(--muted)]">Demo: new articles, likes, and comments reset when you refresh the page.</p>
    </div>
  )
}
