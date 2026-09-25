import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BlogContent from '../components/BlogContent'
import { publishBlog } from '../hooks/useBlogs'
import { readingTime } from '../data/blogs'

const fieldClass = 'mt-2 w-full rounded-lg border border-white/10 bg-[#0c0d10] p-4 text-sm focus:outline-violet-400'

export default function CreateBlog() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const tags = [...new Set(tagInput.split(',').map(tag => tag.trim()).filter(Boolean))]
  const submit = event => {
    event.preventDefault()
    if (title.trim().length < 5) { setError('Use at least 5 characters for your title.'); return }
    if (!tags.length || tags.length > 5 || tags.some(tag => tag.length > 24)) { setError('Add 1–5 comma-separated tags, each up to 24 characters.'); return }
    if (content.trim().length < 100) { setError('Write at least 100 characters for your article.'); return }
    const id = publishBlog({ title, tags, content })
    navigate(`/blogs/${id}`)
  }
  return <div className="mx-auto max-w-4xl space-y-7"><Link to="/blogs" className="inline-block text-sm text-violet-300">← All blogs</Link><header><p className="mb-2 font-mono text-xs tracking-widest text-violet-400">SHARE WHAT YOU KNOW</p><h1>Create a blog</h1><p className="mt-2 text-sm text-zinc-400">Turn your experience into someone else’s next breakthrough.</p></header>
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-8">
      <div><label htmlFor="blog-title" className="text-sm font-medium">Blog title</label><input id="blog-title" required minLength={5} maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="Give your story a great title…" className={fieldClass} /></div>
      <div><p className="text-sm font-medium">Cover image</p><div className="mt-2 flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-violet-400/25 bg-violet-500/5"><span aria-hidden="true" className="font-mono text-3xl text-violet-400">&lt;/&gt;</span><p className="text-sm text-zinc-400">Your article’s cover placeholder</p><p className="text-xs text-zinc-500">Demo artwork · image upload is unavailable</p></div></div>
      <div><label htmlFor="blog-tags" className="text-sm font-medium">Tags</label><input id="blog-tags" required maxLength={128} value={tagInput} onChange={event => setTagInput(event.target.value)} placeholder="React, JavaScript, Web Development" aria-describedby="tags-help" className={fieldClass} /><p id="tags-help" className="mt-2 text-xs text-zinc-500">Add 1–5 tags separated by commas. Up to 24 characters each.</p></div>
      <div><div className="flex flex-wrap items-center justify-between gap-3"><label htmlFor="blog-content" className="text-sm font-medium">Article editor</label><span className="text-xs text-zinc-500">{readingTime(content)}</span></div><p id="editor-help" className="mt-2 text-xs leading-5 text-zinc-500">Write 100–30,000 characters. Separate paragraphs with a blank line; use ## for a section heading.</p><textarea id="blog-content" required minLength={100} maxLength={30000} rows={15} value={content} onChange={event => setContent(event.target.value)} placeholder="Every great article starts with an idea…" aria-describedby="editor-help" className={`${fieldClass} font-mono leading-7`} /></div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5"><p className="max-w-sm text-xs leading-5 text-zinc-500">Publishing adds this article to the local demo. Articles and drafts reset on reload.</p><div className="flex gap-3"><button type="button" aria-expanded={preview} aria-controls="article-preview" onClick={() => setPreview(value => !value)} className="rounded-lg border border-white/15 px-5 py-3 text-sm hover:bg-white/5">{preview ? 'Hide preview' : 'Preview'}</button><button type="submit" className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Publish</button></div></div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    </form>
    {preview && <section id="article-preview" aria-labelledby="preview-heading" className="space-y-5 rounded-xl border border-violet-400/25 bg-[#121317] p-5 sm:p-8"><p id="preview-heading" className="font-mono text-xs uppercase tracking-widest text-violet-400">Article preview</p><h2 className="break-words text-3xl font-bold">{title || 'Your blog title'}</h2><p className="text-xs text-zinc-500">You · {readingTime(content)}</p><div className="flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="break-all rounded-md bg-violet-500/10 px-3 py-1 text-xs text-violet-300">{tag}</span>)}</div>{content ? <BlogContent content={content} /> : <p className="text-sm text-zinc-500">Start writing to see your article here.</p>}</section>}
  </div>
}
