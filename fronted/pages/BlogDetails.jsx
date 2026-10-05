import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { addBlogComment, toggleBlogLike, useBlogs } from '../hooks/useBlogs'
import { formatBlogDate } from '../data/blogs'
import BlogContent from '../components/BlogContent'
import BlogCover from '../components/BlogCover'
import Icon from '../components/Icon'

function Article({ blog }) {
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState('')
  const commentsSection = useRef(null)
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#comments') commentsSection.current?.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0, left: 0 })
  }, [blog.id, hash])

  const submit = event => {
    event.preventDefault()
    if (!comment.trim()) return
    addBlogComment(blog.id, comment)
    setComment('')
    setNotice('Your comment has been added.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <Link to="/blogs" className="inline-block text-sm text-[var(--accent)] hover:underline">← All blogs</Link>
      <header>
        <h1 className="break-words leading-tight sm:text-4xl">{blog.title}</h1>
        <p className="mt-4 break-words text-base leading-7 text-[var(--muted)]">{blog.description}</p>
        <div className="mt-6 flex items-center gap-3">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm text-[var(--accent)]">{blog.author.split(' ').map(name => name[0]).join('')}</span>
          <div><p className="text-sm font-medium text-[var(--text)]">{blog.author}</p><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]"><time dateTime={blog.publishedAt}>{formatBlogDate(blog.publishedAt)}</time><span>· {blog.readingTime}</span></div></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {blog.tags.map(tag => <Link key={tag} to={`/blogs?tag=${encodeURIComponent(tag)}`} className="max-w-full break-words rounded-md border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-soft)]">{tag}</Link>)}
        </div>
      </header>
      <BlogCover category={blog.category} icon={blog.icon} accent={blog.accent} large />
      <article aria-label="Article content" className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8"><BlogContent content={blog.content} /></article>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[var(--border)] py-5">
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => toggleBlogLike(blog.id)} aria-pressed={blog.liked} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${blog.liked ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]'}`}><Icon name="heart" className={`size-4 ${blog.liked ? 'fill-current' : ''}`} />{blog.liked ? 'Liked' : 'Like'} · {blog.likes}</button>
          <a href="#comments" className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]"><Icon name="message" className="size-4" />{blog.comments.length} comments</a>
        </div>
      </div>
      <section ref={commentsSection} id="comments" aria-labelledby="comments-heading" className="scroll-mt-36 space-y-5 md:scroll-mt-24">
        <h2 id="comments-heading" className="text-xl font-semibold">Comments ({blog.comments.length})</h2>
        <form onSubmit={submit} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <label htmlFor="blog-comment" className="text-sm font-semibold">Add a comment</label>
          <textarea id="blog-comment" required maxLength={2000} rows={4} value={comment} onChange={event => { setComment(event.target.value); setNotice('') }} placeholder="Share your thoughts or ask a question…" aria-describedby="comment-help" className="mt-3 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--page)] p-4 text-sm leading-6 focus:outline-[var(--accent)]" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p id="comment-help" className="text-xs text-[var(--muted)]">Commenting as You · {comment.length}/2,000</p><button type="submit" disabled={!comment.trim()} className="ui-button disabled:cursor-not-allowed disabled:opacity-50">Post comment</button></div>
          <p role="status" className="mt-3 text-sm text-[var(--accent)]">{notice}</p>
        </form>
        {blog.comments.map(item => (
          <article key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-raised)] text-xs text-[var(--accent)]">{item.author.split(' ').map(name => name[0]).join('')}</span><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"><span className="font-medium text-[var(--text)]">{item.author}</span><time dateTime={item.publishedAt} className="text-[var(--muted)]">{formatBlogDate(item.publishedAt)}</time></div></div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text)]">{item.body}</p>
          </article>
        ))}
        {!blog.comments.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">No comments yet. Start the conversation.</p>}
        <p className="text-xs text-[var(--muted)]">Demo: new articles, likes, and comments reset when you refresh the page.</p>
      </section>
    </div>
  )
}

export default function BlogDetails() {
  const { id } = useParams()
  const blog = useBlogs().find(item => item.id === id)
  if (!blog) return (
    <section className="mx-auto max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <Icon name="book" className="mx-auto mb-5 size-10 text-[var(--accent)]" /><h1>Blog not found</h1>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">This article is unavailable. Articles added in the demo reset when you refresh the page.</p>
      <Link to="/blogs" className="mt-6 inline-block text-[var(--accent)]">Browse blogs →</Link>
    </section>
  )
  return <Article key={blog.id} blog={blog} />
}
