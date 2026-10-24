import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BlogContent from '../components/BlogContent.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import api from '../src/lib/api.js'
import { mapBlog } from '../hooks/useBlogs.js'

const slugify = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120).replace(/-$/g, '')
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export default function CreateBlog() {
  const { slug: routeSlug } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(routeSlug)
  const [form, setForm] = useState({ title: '', slug: '', content: '', tags: '', status: 'draft' })
  const [slugEdited, setSlugEdited] = useState(editing)
  const [mine, setMine] = useState([])
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let active = true
    api.blogs.mine()
      .then(payload => { if (active) setMine(payload.data.map(mapBlog)) })
      .catch(() => { if (active) setMine([]) })
    if (editing) {
      api.blogs.mineGet(routeSlug)
        .then(payload => {
          if (active) {
            const blog = payload.data
            setForm({ title: blog.title, slug: blog.slug, content: blog.content, tags: (blog.tags || []).join(', '), status: blog.status })
          }
        })
        .catch(reason => { if (active) setError(reason.message || 'Could not load your blog.') })
        .finally(() => { if (active) setLoading(false) })
    }
    return () => { active = false }
  }, [editing, routeSlug])

  function change(field, value) {
    setForm(current => {
      const next = { ...current, [field]: value }
      if (field === 'title' && !slugEdited) next.slug = slugify(value)
      return next
    })
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    const tags = form.tags.split(',').map(value => value.trim()).filter(Boolean)
    if (form.title.trim().length < 5 || form.title.trim().length > 180) return setFieldError('Title must be between 5 and 180 characters.')
    if (form.content.trim().length < 20 || form.content.length > 40000) return setFieldError('Content must be between 20 and 40000 characters.')
    if (!slugPattern.test(form.slug) || form.slug.length > 120) return setFieldError('Use a lowercase slug with letters, numbers, and single hyphens.')
    if (tags.length > 10 || tags.some(item => item.length > 30)) return setFieldError('Use up to 10 tags, each no longer than 30 characters.')
    setFieldError('')
    setSaving(true)
    try {
      const details = { title: form.title.trim(), slug: form.slug, content: form.content.trim(), tags, status: form.status }
      const response = editing ? await api.blogs.update(routeSlug, details) : await api.blogs.create(details)
      const saved = response.data
      navigate(saved.status === 'published' ? `/blogs/${encodeURIComponent(saved.slug)}` : `/blogs/${encodeURIComponent(saved.slug)}/edit`, { replace: true })
    } catch (reason) { setError(reason.message || 'Could not save your blog.') }
    finally { setSaving(false) }
  }

  async function remove() {
    setSaving(true)
    try { await api.blogs.remove(routeSlug); navigate('/create-blog', { replace: true }); setConfirmDelete(false) }
    catch (reason) { setError(reason.message || 'Could not delete your blog.'); setConfirmDelete(false) }
    finally { setSaving(false) }
  }

  if (loading) return <main role="status" className="mx-auto max-w-5xl px-4 py-16 text-center text-[var(--muted)]">Loading your blog…</main>

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8"><Link to="/blogs" className="text-sm text-[var(--muted)]">← All blogs</Link><h1 className="mt-3 text-3xl font-bold">{editing ? 'Edit blog' : 'Write a blog'}</h1><p className="mt-2 text-[var(--muted)]">Drafts are private until you publish them.</p></div>
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-300 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <form onSubmit={submit} className="space-y-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <label className="block text-sm font-medium">Title<input required minLength="5" maxLength="180" value={form.title} onChange={e => change('title', e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Slug<input required maxLength="120" pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={e => { setSlugEdited(true); change('slug', e.target.value) }} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2.5 font-mono text-sm" /><span className="mt-1 block text-xs text-[var(--muted)]">URL: /blogs/{form.slug || 'your-title'}</span></label>
          <label className="block text-sm font-medium">Tags, comma separated<input value={form.tags} onChange={e => change('tags', e.target.value)} placeholder="react, javascript" className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2.5" /></label>
          <label className="block text-sm font-medium">Content<textarea required minLength="20" maxLength="40000" rows="16" value={form.content} onChange={e => change('content', e.target.value)} className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2.5 font-mono text-sm" /><span className="mt-1 block text-xs text-[var(--muted)]">Markdown supported. {form.content.length}/40000</span></label>
          <label className="block text-sm font-medium">Publication<select value={form.status} onChange={e => change('status', e.target.value)} className="mt-2 block rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2.5"><option value="draft">Save as draft</option><option value="published">Publish</option></select></label>
          {fieldError && <p role="alert" className="text-sm text-red-700">{fieldError}</p>}
          <div className="flex flex-wrap gap-3"><button disabled={saving} className="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-semibold text-white">{saving ? 'Saving…' : editing ? 'Save changes' : 'Save blog'}</button>{editing && <button type="button" disabled={saving} onClick={() => setConfirmDelete(true)} className="rounded-lg border border-red-300 px-4 py-2.5 text-red-700">Delete</button>}</div>
        </form>
        <aside className="min-w-0"><h2 className="mb-3 text-lg font-semibold">Preview</h2><div className="max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><h3 className="mb-5 break-words text-2xl font-bold">{form.title || 'Your title'}</h3><BlogContent content={form.content || 'Your content preview will appear here.'} /></div>
          <section className="mt-8"><h2 className="mb-3 text-lg font-semibold">Your writing</h2>{mine.length ? <ul className="space-y-2">{mine.map(blog => <li key={blog.id} className="rounded-lg border border-[var(--border)] p-3"><Link to={`/blogs/${encodeURIComponent(blog.slug)}/edit`} className="font-medium hover:text-[var(--accent)]">{blog.title}</Link><span className="ml-2 text-xs text-[var(--muted)]">{blog.status}</span></li>)}</ul> : <p className="text-sm text-[var(--muted)]">Your drafts and published blogs will appear here.</p>}</section>
        </aside>
      </div>
      {confirmDelete && <ConfirmDialog title="Delete this blog?" description="This action cannot be undone." busy={saving} confirmLabel="Delete blog" busyLabel="Deleting…" onConfirm={remove} onCancel={() => setConfirmDelete(false)} />}
    </main>
  )
}
