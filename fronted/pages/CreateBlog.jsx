import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BlogContent from '../components/BlogContent'
import BlogCover from '../components/BlogCover'
import Icon from '../components/Icon'
import { publishBlog, useBlogs } from '../hooks/useBlogs'
import { formatBlogDate, readingTime } from '../data/blogs'

const fieldClass = 'mt-2 w-full rounded-lg border border-white/10 bg-[#0c0d10] p-4 text-sm text-zinc-200 focus:border-violet-400 focus:outline-violet-400'
const formats = [
  { label: 'Heading', symbol: 'H2', before: '## ', after: '', placeholder: 'Section heading', block: true },
  { label: 'Bold', symbol: 'B', before: '**', after: '**', placeholder: 'bold text' },
  { label: 'Italic', symbol: 'I', before: '*', after: '*', placeholder: 'italic text' },
  { label: 'Bullet list', symbol: '• List', before: '- ', after: '', placeholder: 'List item', block: true },
  { label: 'Quote', symbol: '❝', before: '> ', after: '', placeholder: 'A thought worth sharing', block: true },
  { label: 'Code block', symbol: '</>', before: '```\n', after: '\n```', placeholder: 'const idea = "Hello, DevHub!"', block: true },
]


export default function CreateBlog() {
  const navigate = useNavigate()
  const blogs = useBlogs()
  const formRef = useRef(null)
  const editorRef = useRef(null)
  const previewRef = useRef(null)
  const [title, setTitle] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [errors, setErrors] = useState({})
  const knownTags = [...new Set(blogs.flatMap(blog => blog.tags))]
  const tags = [...new Map(tagInput.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => [
    tag.toLowerCase(), knownTags.find(known => known.toLowerCase() === tag.toLowerCase()) || tag.toLowerCase(),
  ])).values()]
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const clearError = field => setErrors(current => ({ ...current, [field]: undefined }))
  const togglePreview = () => {
    setPreview(!preview)
    requestAnimationFrame(() => {
      if (!preview) previewRef.current?.focus()
      else editorRef.current?.focus()
    })
  }

  const applyFormat = format => {
    const editor = editorRef.current
    const start = editor.selectionStart
    const end = editor.selectionEnd
    const selected = content.slice(start, end) || format.placeholder
    const before = content.slice(0, start)
    const after = content.slice(end)
    const leading = format.block && before && !before.endsWith('\n\n') ? '\n\n' : ''
    const trailing = format.block && after && !after.startsWith('\n\n') ? '\n\n' : ''
    const next = `${before}${leading}${format.before}${selected}${format.after}${trailing}${after}`
    if (next.length > 30000) {
      setErrors(current => ({ ...current, content: 'Keep your article under 30,000 characters.' }))
      return
    }
    setContent(next)
    clearError('content')
    requestAnimationFrame(() => {
      editor.focus()
      const selectionStart = start + leading.length + format.before.length
      editor.setSelectionRange(selectionStart, selectionStart + selected.length)
    })
  }

  const submit = event => {
    event.preventDefault()
    const nextErrors = {}
    if (title.trim().length < 5 || title.trim().length > 160) nextErrors.title = 'Use 5–160 characters for your title.'
    if (!tags.length || tags.length > 5 || tags.some(tag => tag.length > 24)) nextErrors.tags = 'Add 1–5 comma-separated tags, each up to 24 characters.'
    if (content.trim().length < 100 || content.length > 30000) nextErrors.content = 'Write 100–30,000 characters for your article.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setPreview(false)
      requestAnimationFrame(() => formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus())
      return
    }
    const id = publishBlog({ title, tags, content })
    navigate(`/blogs/${id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link to="/blogs" className="inline-block text-sm text-violet-300 hover:text-violet-200">← All blogs</Link>
      <header><p className="mb-2 font-mono text-xs tracking-widest text-violet-400">SHARE WHAT YOU KNOW</p><h1>Create a blog</h1><p className="mt-3 text-sm leading-6 text-zinc-400">A useful lesson. A new perspective. A small discovery. Your next article starts here.</p></header>
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-7 rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-8">
        <div>
          <div className="flex items-center justify-between gap-3"><label htmlFor="blog-title" className="text-sm font-semibold">Blog title</label><span className="text-xs text-zinc-400">{title.length}/160</span></div>
          <input id="blog-title" name="title" required minLength={5} maxLength={160} value={title} onChange={event => { setTitle(event.target.value); clearError('title') }} placeholder="Give your story a great title…" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} className={fieldClass} />
          {errors.title && <p id="title-error" role="alert" className="mt-2 text-xs text-rose-300">{errors.title}</p>}
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Cover image</p>
          <BlogCover large />
          <p className="mt-2 text-xs text-zinc-400">A DevHub placeholder will accompany your article.</p>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3"><label htmlFor="blog-tags" className="text-sm font-semibold">Tags</label><span className="text-xs text-zinc-400">{tags.length}/5</span></div>
          <input id="blog-tags" name="tags" required maxLength={160} value={tagInput} onChange={event => { setTagInput(event.target.value); clearError('tags') }} placeholder="React, JavaScript, Web Development" aria-invalid={Boolean(errors.tags)} aria-describedby={`tags-help${errors.tags ? ' tags-error' : ''}`} className={fieldClass} />
          <p id="tags-help" className="mt-2 text-xs text-zinc-400">Add 1–5 tags separated by commas. Up to 24 characters each.</p>
          {errors.tags && <p id="tags-error" role="alert" className="mt-2 text-xs text-rose-300">{errors.tags}</p>}
          {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="max-w-full break-all rounded-md border border-violet-400/15 bg-violet-500/10 px-2.5 py-1 font-mono text-xs text-violet-300">#{tag}</span>)}</div>}
        </div>
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><label htmlFor="blog-content" className="text-sm font-semibold">Article editor</label><span className="flex items-center gap-1.5 text-xs text-zinc-400"><Icon name="clock" className="size-3.5" />{wordCount} words · {readingTime(content)}</span></div>
          <div className="overflow-hidden rounded-xl border border-white/10 focus-within:border-violet-400/50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.02] p-2">
              <div role="group" aria-label="Article formatting" className="flex flex-wrap gap-1">
                {formats.map(format => <button key={format.label} type="button" title={format.label} aria-label={format.label} disabled={preview} onClick={() => applyFormat(format)} className={`min-w-8 rounded px-2 py-2 font-mono text-xs text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 ${format.label === 'Bold' ? 'font-bold' : ''} ${format.label === 'Italic' ? 'italic' : ''}`}>{format.symbol}</button>)}
              </div>
              <span className="px-2 font-mono text-[10px] uppercase tracking-wider text-violet-300">{preview ? 'Preview' : 'Markdown'}</span>
            </div>
            <textarea ref={editorRef} hidden={preview} id="blog-content" name="content" required minLength={100} maxLength={30000} rows={16} value={content} onChange={event => { setContent(event.target.value); clearError('content') }} placeholder="Every great article starts with an idea…" aria-invalid={Boolean(errors.content)} aria-describedby={`editor-help${errors.content ? ' content-error' : ''}`} className="w-full resize-y bg-[#0c0d10] p-4 font-mono text-sm leading-7 text-zinc-200 focus:outline-none sm:p-6" />
            {preview && (
              <section ref={previewRef} id="article-preview" tabIndex={-1} aria-labelledby="preview-heading" className="min-w-0 space-y-5 bg-[#0c0d10] p-5 outline-none sm:p-7">
                <p id="preview-heading" className="font-mono text-xs uppercase tracking-widest text-violet-300">Article preview</p>
                <h2 className="break-words text-2xl font-bold leading-tight sm:text-3xl">{title.trim() || 'Your blog title'}</h2>
                <p className="text-xs text-zinc-400">You · {formatBlogDate(new Date())} · {readingTime(content)}</p>
                <div className="flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="max-w-full break-all rounded-md bg-violet-500/10 px-3 py-1 text-xs text-violet-300">{tag}</span>)}</div>
                <BlogCover category="COMMUNITY" icon="book" large />
                {content.trim() ? <BlogContent content={content} /> : <p className="py-10 text-center text-sm text-zinc-400">Start writing to see your article here.</p>}
              </section>
            )}
          </div>
          <p id="editor-help" className="mt-3 text-xs leading-5 text-zinc-400">Use the toolbar or Markdown: ## headings, **bold**, *italic*, - lists, &gt; quotes, and triple backticks for code. Write at least 100 characters.</p>
          {errors.content && <p id="content-error" role="alert" className="mt-2 text-xs text-rose-300">{errors.content}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <p className="max-w-xs text-xs leading-5 text-zinc-400">Publishing adds your article to this demo. Articles and drafts reset on reload.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" aria-expanded={preview} aria-controls={preview ? 'article-preview' : 'blog-content'} onClick={togglePreview} className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm hover:bg-white/5"><Icon name={preview ? 'code' : 'eye'} className="size-4" />{preview ? 'Edit article' : 'Preview'}</button>
            <button type="submit" className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Publish</button>
          </div>
        </div>
      </form>
    </div>
  )
}
