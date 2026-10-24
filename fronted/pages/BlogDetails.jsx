import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BlogContent from '../components/BlogContent.jsx'
import ReportButton from '../components/ReportButton.jsx'
import BlogCover from '../components/BlogCover.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { formatBlogDate, readingTime } from '../data/blogs.js'
import { useMockSession } from '../src/state/useMockSession.js'
import api from '../src/lib/api.js'
import { mapBlog } from '../hooks/useBlogs.js'

export default function BlogDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useMockSession()
  const [blog, setBlog] = useState(null)
  const [loadedSlug, setLoadedSlug] = useState('')
  const [error, setError] = useState(null)
  const loading = loadedSlug !== slug && error?.slug !== slug
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    api.blogs.get(slug)
      .then(payload => { if (active) { setBlog(mapBlog(payload.data)); setLoadedSlug(slug); setError(null) } })
      .catch(reason => { if (active) setError({ slug, message: reason.message || 'Could not load this blog.' }) })
    return () => { active = false }
  }, [slug])

  const owner = blog && String(user?._id || user?.id || '') === blog.authorId
  async function deleteBlog() {
    setDeleting(true)
    try { await api.blogs.remove(slug); navigate('/blogs', { replace: true }) }
    catch (reason) { setError({ slug, message: reason.message || 'Could not delete this blog.' }); setConfirmDelete(false) }
    finally { setDeleting(false) }
  }

  if (loading) return <div role="status" aria-live="polite" aria-busy="true" className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[var(--muted)]">Loading blog…</div>
  if (error?.slug === slug && !blog) return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><p role="alert" className="ui-card border-[var(--danger)] p-5 text-sm text-[var(--danger)]">{error.message}</p><Link to="/blogs" className="ui-button-secondary mt-4">Back to blogs</Link></div>
  if (!blog) return null

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
      <Link to="/blogs" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]">← All blogs</Link>
      <div className="mt-5"><BlogCover category={blog.category} icon="code" large /></div>
      <header className="mx-auto max-w-3xl border-b border-[var(--border)] py-6 sm:py-8">
        {!!blog.tags.length && <div className="flex flex-wrap gap-2">{blog.tags.map(item => <Link key={item} to={`/blogs?tag=${encodeURIComponent(item)}`} className="max-w-full break-words rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]">{item}</Link>)}</div>}
        <h1 className="mt-4 break-words text-3xl font-bold tracking-tight sm:text-4xl">{blog.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--muted)]"><span className="break-words">By <strong className="font-medium text-[var(--text)]">{blog.author}</strong></span><span>{readingTime(blog.content)} <span aria-hidden="true">·</span> <time dateTime={blog.publishedAt}>{formatBlogDate(blog.publishedAt)}</time></span></div>
        {!owner && <div className="mt-4"><ReportButton targetType="blog" targetId={blog._id} /></div>}
        {owner && <div className="mt-5 flex flex-wrap gap-2"><Link to={`/blogs/${encodeURIComponent(blog.slug)}/edit`} className="ui-button-secondary">Edit</Link><button type="button" onClick={() => setConfirmDelete(true)} className="ui-button-secondary text-[var(--danger)]">Delete</button></div>}
      </header>
      {error?.slug === slug && blog?.slug === slug && <p role="alert" className="mx-auto mt-5 max-w-3xl rounded-lg border border-[var(--danger)] p-3 text-sm text-[var(--danger)]">{error.message}</p>}
      <article className="mx-auto max-w-3xl py-6 sm:py-8"><BlogContent content={blog.content} /></article>
      {confirmDelete && <ConfirmDialog title="Delete this blog?" description="This action cannot be undone." busy={deleting} confirmLabel="Delete blog" busyLabel="Deleting…" onConfirm={deleteBlog} onCancel={() => setConfirmDelete(false)} />}
    </div>
  )
}
