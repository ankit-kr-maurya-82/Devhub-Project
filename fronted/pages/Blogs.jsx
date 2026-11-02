import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BlogCard from '../components/BlogCard.jsx'
import api from '../src/lib/api.js'
import { mapBlog } from '../hooks/useBlogs.js'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import Skeleton from '../components/Skeleton.jsx'

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
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <PageHeader className="mb-6 sm:mb-8" eyebrow="DevHub writing" title="Blogs" description="Ideas, guides, and notes from the community." action={<Link to="/create-blog" className="ui-button">Write a blog</Link>} />
      <form className="mb-5 flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:mb-6 sm:p-4" onSubmit={event => { event.preventDefault(); updateParams({ search: query.trim(), page: '' }) }}>
        <label className="sr-only" htmlFor="blog-search">Search blogs</label>
        <input id="blog-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search published blogs" className="ui-input min-w-0 flex-1" />
        <button className="ui-button-secondary">Search</button>
        {(search || tag) && <button type="button" onClick={() => { setQuery(''); setParams({}) }} className="ui-button-secondary">Clear filters</button>}
      </form>
      {tag && <p className="mb-4 text-sm text-[var(--muted)]">Filtered by <strong className="font-medium text-[var(--text)]">{tag}</strong></p>}
      {loading && <div role="status" aria-live="polite" aria-busy="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><span className="sr-only">Loading blogs…</span>{Array.from({ length: 6 }, (_, index) => <div key={index} aria-hidden="true" className="ui-card overflow-hidden"><Skeleton className="h-24 rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-6 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div></div>)}</div>}
      {!loading && error?.key === requestKey && <ErrorState title="Could not load blogs" description={error.message} onRetry={() => setRefreshCount(count => count + 1)} />}
      {!loading && !error && result.data.length === 0 && <EmptyState title={search || tag ? 'No matching blogs' : 'No published blogs yet'} description={search || tag ? 'Try another search or clear your filters.' : 'Be the first to publish a blog.'} action={(search || tag) ? <button type="button" onClick={() => { setQuery(''); setParams({}) }} className="ui-button-secondary">Clear filters</button> : <Link to="/create-blog" className="ui-button">Write the first blog</Link>} />}
      {!loading && !error && result.data.length > 0 && <>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">{result.data.map(blog => <BlogCard key={blog.id} blog={blog} selectedTag={tag} onTagSelect={selected => updateParams({ tag: selected, page: '' })} />)}</div>
        <nav aria-label="Blog pages" className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button type="button" disabled={!result.pagination?.hasPrevPage} onClick={() => updateParams({ page: String(Number(page) - 1) })} className="ui-button-secondary">Previous</button>
          <span aria-live="polite" className="text-sm text-[var(--muted)]">Page {result.pagination?.page || 1} of {Math.max(1, result.pagination?.totalPages || 1)}</span>
          <button type="button" disabled={!result.pagination?.hasNextPage} onClick={() => updateParams({ page: String(Number(page) + 1) })} className="ui-button-secondary">Next</button>
        </nav>
      </>}
    </div>
  )
}
