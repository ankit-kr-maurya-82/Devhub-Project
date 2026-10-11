import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BlogCard from '../components/BlogCard.jsx'
import api from '../src/lib/api.js'
import { mapBlog } from '../hooks/useBlogs.js'

export default function Blogs() {
  const [params, setParams] = useSearchParams()
  const page = params.get('page') || '1'
  const search = params.get('search') || ''
  const tag = params.get('tag') || ''
  const [query, setQuery] = useState(search)
  const [result, setResult] = useState({ data: [], pagination: null })
  const [refreshCount, setRefreshCount] = useState(0)
  const [resultKey, setResultKey] = useState('')
  const [error, setError] = useState(null)
  const requestKey = `${page}|${search}|${tag}|${refreshCount}`
  const loading = resultKey !== requestKey && error?.key !== requestKey

  useEffect(() => {
    let active = true
    api.blogs.list({ page, limit: '9', ...(search && { search }), ...(tag && { tag }) })
      .then(payload => { if (active) { setResult({ data: payload.data.map(mapBlog), pagination: payload.pagination }); setResultKey(requestKey); setError(null) } })
      .catch(reason => { if (active) setError({ key: requestKey, message: reason.message || 'Could not load blogs.' }) })
    return () => { active = false }
  }, [page, search, tag, requestKey])

  function updateParams(next) {
    setParams(current => {
      const updated = new URLSearchParams(current)
      Object.entries(next).forEach(([key, value]) => value ? updated.set(key, value) : updated.delete(key))
      if (!('page' in next)) updated.delete('page')
      return updated
    })
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-[var(--accent)]">DevHub writing</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Blogs</h1><p className="mt-2 text-[var(--muted)]">Ideas, guides, and notes from the community.</p></div>
        <Link to="/create-blog" className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white">Write a blog</Link>
      </div>
      <form className="mb-7 flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); updateParams({ search: query.trim(), page: '' }) }}>
        <label className="sr-only" htmlFor="blog-search">Search blogs</label>
        <input id="blog-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search published blogs" className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5" />
        <button className="rounded-lg border border-[var(--border)] px-4 py-2.5 font-medium">Search</button>
        {(search || tag) && <button type="button" onClick={() => { setQuery(''); setParams({}) }} className="rounded-lg px-3 py-2.5 text-sm text-[var(--muted)]">Clear filters</button>}
      </form>
      {tag && <p className="mb-4 text-sm text-[var(--muted)]">Filtered by <strong>{tag}</strong></p>}
      {loading && <p role="status" className="py-12 text-center text-[var(--muted)]">Loading blogs…</p>}
      {!loading && error?.key === requestKey && <div role="alert" className="rounded-lg border border-red-300 p-4 text-red-700">{error.message} <button onClick={() => setRefreshCount(count => count + 1)} className="ml-2 underline">Retry</button></div>}
      {!loading && !error && result.data.length === 0 && <div className="rounded-xl border border-[var(--border)] p-10 text-center"><h2 className="font-semibold">No published blogs found</h2><p className="mt-2 text-sm text-[var(--muted)]">Try another search or be the first to publish.</p></div>}
      {!loading && !error && result.data.length > 0 && <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.data.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={tag} onTagSelect={selected => updateParams({ tag: selected, page: '' })} />)}</div>
        <nav aria-label="Blog pages" className="mt-8 flex items-center justify-center gap-4">
          <button disabled={!result.pagination?.hasPrevPage} onClick={() => updateParams({ page: String(Number(page) - 1) })} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Previous</button>
          <span className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span>
          <button disabled={!result.pagination?.hasNextPage} onClick={() => updateParams({ page: String(Number(page) + 1) })} className="rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-40">Next</button>
        </nav>
      </>}
    </main>
  )
}
