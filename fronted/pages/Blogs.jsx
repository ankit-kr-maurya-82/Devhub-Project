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
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <header className="ui-page-header mb-6 sm:mb-8">
        <div className="min-w-0"><p className="text-sm font-medium text-[var(--accent)]">DevHub writing</p><h1 className="mt-1">Blogs</h1><p className="mt-2 text-sm text-[var(--muted)]">Ideas, guides, and notes from the community.</p></div>
        <Link to="/create-blog" className="ui-button">Write a blog</Link>
      </header>
      <form className="mb-5 flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:mb-6 sm:p-4" onSubmit={event => { event.preventDefault(); updateParams({ search: query.trim(), page: '' }) }}>
        <label className="sr-only" htmlFor="blog-search">Search blogs</label>
        <input id="blog-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search published blogs" className="ui-input min-w-0 flex-1" />
        <button className="ui-button-secondary">Search</button>
        {(search || tag) && <button type="button" onClick={() => { setQuery(''); setParams({}) }} className="ui-button-secondary">Clear filters</button>}
      </form>
      {tag && <p className="mb-4 text-sm text-[var(--muted)]">Filtered by <strong className="font-medium text-[var(--text)]">{tag}</strong></p>}
      {loading && <p role="status" aria-live="polite" aria-busy="true" className="ui-card p-8 text-center text-sm text-[var(--muted)]">Loading blogs…</p>}
      {!loading && error?.key === requestKey && <div role="alert" className="ui-card flex flex-wrap items-center justify-between gap-3 border-[var(--danger)] p-4 text-sm text-[var(--danger)]"><span>{error.message}</span><button type="button" onClick={() => setRefreshCount(count => count + 1)} className="ui-button-secondary">Retry</button></div>}
      {!loading && !error && result.data.length === 0 && <div className="ui-card p-7 text-center sm:p-10"><h2 className="font-semibold">{search || tag ? 'No matching blogs' : 'No published blogs yet'}</h2><p className="mt-2 text-sm text-[var(--muted)]">{search || tag ? 'Try another search or clear your filters.' : 'Be the first to publish a blog.'}</p>{(search || tag) && <button type="button" onClick={() => { setQuery(''); setParams({}) }} className="ui-button-secondary mt-4">Clear filters</button>}</div>}
      {!loading && !error && result.data.length > 0 && <>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">{result.data.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={tag} onTagSelect={selected => updateParams({ tag: selected, page: '' })} />)}</div>
        <nav aria-label="Blog pages" className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button disabled={!result.pagination?.hasPrevPage} onClick={() => updateParams({ page: String(Number(page) - 1) })} className="ui-button-secondary">Previous</button>
          <span aria-live="polite" className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span>
          <button disabled={!result.pagination?.hasNextPage} onClick={() => updateParams({ page: String(Number(page) + 1) })} className="ui-button-secondary">Next</button>
        </nav>
      </>}
    </main>
  )
}
