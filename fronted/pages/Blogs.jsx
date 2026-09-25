import { Link, useSearchParams } from 'react-router-dom'
import BlogCard from '../components/BlogCard'
import TagBadge from '../components/TagBadge'
import Icon from '../components/Icon'
import { useBlogs } from '../hooks/useBlogs'

export default function Blogs() {
  const blogs = useBlogs()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const tag = params.get('tag') || ''
  const update = (key, value) => setParams(current => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); return next }, { replace: true })
  const selectTag = value => update('tag', value === tag ? '' : value)
  const visible = blogs.filter(blog => (!tag || blog.tags.includes(tag)) && [blog.title, blog.author, blog.description, ...blog.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  const featured = visible.filter(blog => blog.featured)
  const counts = blogs.reduce((counts, blog) => { blog.tags.forEach(value => { counts[value] = (counts[value] || 0) + 1 }); return counts }, {})
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
  const cards = items => <div className="grid gap-5 md:grid-cols-2">{items.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={tag} onTagSelect={selectTag} />)}</div>
  return <div className="mx-auto max-w-6xl space-y-7">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 font-mono text-xs tracking-widest text-violet-400">IDEAS WORTH SHARING</p><h1>DevHub Blog</h1><p className="mt-2 text-sm text-zinc-400">Fresh perspectives, practical guides, and lessons from building.</p></div><Link to="/create-blog" className="flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400"><Icon name="plus" className="size-4" />Write a blog</Link></header>
    <p className="text-xs text-zinc-500">Mock community · published articles, likes, and comments reset on reload.</p>
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121317] p-4 focus-within:border-violet-400"><Icon name="search" className="text-violet-400 size-5" /><span className="sr-only">Search blogs</span><input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search blogs, authors, or tags…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
    <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-xs text-zinc-500">{visible.length} articles{tag && ` tagged ${tag}`}</p>{(query || tag) && <button onClick={() => setParams({})} className="text-sm text-violet-300">Clear filters ×</button>}</div>
    <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_230px]"><div className="min-w-0 space-y-9">
      {featured.length > 0 && <section aria-labelledby="featured-heading"><h2 id="featured-heading" className="mb-4 text-xl font-semibold">Featured blogs</h2>{cards(featured)}</section>}
      <section aria-labelledby="recent-heading"><h2 id="recent-heading" className="mb-4 text-xl font-semibold">Recent blogs</h2>{visible.length ? cards(visible) : <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center"><h3 className="font-semibold">No blogs found</h3><p className="mt-2 text-sm text-zinc-400">Try another search or clear the filters.</p><button onClick={() => setParams({})} className="mt-4 text-sm text-violet-300">Reset filters</button></div>}</section>
    </div><aside className="rounded-xl border border-white/10 bg-[#121317] p-5"><h2 className="font-semibold">Popular tags</h2><p className="mb-5 mt-2 text-xs leading-5 text-zinc-500">Follow your curiosity. Explore a topic.</p><div className="flex flex-wrap gap-2">{tags.map(value => <TagBadge key={value} tag={value} selected={tag === value} onSelect={selectTag} />)}</div>{tag && <button onClick={() => update('tag', '')} className="mt-5 text-xs text-violet-300">Clear tag ×</button>}<div className="mt-6 border-t border-white/10 pt-5"><h3 className="text-sm font-medium">Your experience could help someone.</h3><p className="mt-2 text-xs leading-5 text-zinc-500">Share a lesson, a discovery, or something you wish you knew sooner.</p><Link to="/create-blog" className="mt-4 inline-block text-sm text-violet-300">Start writing →</Link></div></aside></div>
  </div>
}
