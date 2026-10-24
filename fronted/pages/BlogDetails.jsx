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

  if (loading) return <main role="status" className="mx-auto max-w-4xl px-4 py-16 text-center text-[var(--muted)]">Loading blog…</main>
  if (error?.slug === slug && !blog) return <main className="mx-auto max-w-4xl px-4 py-16"><p role="alert" className="text-red-700">{error.message}</p><Link to="/blogs" className="mt-4 inline-block underline">Back to blogs</Link></main>
  if (!blog) return null

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/blogs" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">← All blogs</Link>
      <div className="mt-6"><BlogCover category={blog.category} icon="code" large /></div>
      <header className="py-8">
        <div className="flex flex-wrap gap-2">{blog.tags.map(item => <Link key={item} to={`/blogs?tag=${encodeURIComponent(item)}`} className="rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-xs text-[var(--muted)]">{item}</Link>)}</div>
        <h1 className="mt-4 break-words text-3xl font-bold tracking-tight sm:text-4xl">{blog.title}</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]"><span>By {blog.author}</span><span>{readingTime(blog.content)} · <time dateTime={blog.publishedAt}>{formatBlogDate(blog.publishedAt)}</time></span></div>
        {!owner && <div className="mt-4"><ReportButton targetType="blog" targetId={blog._id} /></div>}
        {owner && <div className="mt-5 flex gap-3"><Link to={`/blogs/${encodeURIComponent(blog.slug)}/edit`} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm">Edit</Link><button onClick={() => setConfirmDelete(true)} className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700">Delete</button></div>}
      </header>
      {error?.slug === slug && blog?.slug === slug && <p role="alert" className="mb-4 text-sm text-red-700">{error.message}</p>}
      <article className="border-t border-[var(--border)] py-8"><BlogContent content={blog.content} /></article>
      {confirmDelete && <ConfirmDialog title="Delete this blog?" description="This action cannot be undone." busy={deleting} confirmLabel="Delete blog" busyLabel="Deleting…" onConfirm={deleteBlog} onCancel={() => setConfirmDelete(false)} />}
    </main>
  )
}
