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
      <Link to="/blogs" className="inline-block text-sm text-violet-300 hover:text-violet-200">← All blogs</Link>
      <header>
        <p className="mb-3 font-mono text-xs tracking-widest text-violet-400">{blog.category}</p>
        <h1 className="break-words leading-tight sm:text-4xl">{blog.title}</h1>
        <p className="mt-4 break-words text-base leading-7 text-zinc-400">{blog.description}</p>
        <div className="mt-6 flex items-center gap-3">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm text-violet-300">{blog.author.split(' ').map(name => name[0]).join('')}</span>
          <div><p className="text-sm font-medium text-zinc-200">{blog.author}</p><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400"><time dateTime={blog.publishedAt}>{formatBlogDate(blog.publishedAt)}</time><span>· {blog.readingTime}</span></div></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {blog.tags.map(tag => <Link key={tag} to={`/blogs?tag=${encodeURIComponent(tag)}`} className="max-w-full break-words rounded-md border border-violet-400/10 bg-violet-500/10 px-3 py-1 font-mono text-xs text-violet-300 hover:bg-violet-500/20">{tag}</Link>)}
        </div>
      </header>
      <BlogCover category={blog.category} icon={blog.icon} accent={blog.accent} large />
      <article aria-label="Article content" className="min-w-0 rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-8"><BlogContent content={blog.content} /></article>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => toggleBlogLike(blog.id)} aria-pressed={blog.liked} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${blog.liked ? 'border-violet-400/40 bg-violet-500/20 text-violet-300' : 'border-white/10 text-zinc-300 hover:border-violet-400/40'}`}><Icon name="heart" className={`size-4 ${blog.liked ? 'fill-current' : ''}`} />{blog.liked ? 'Liked' : 'Like'} · {blog.likes}</button>
          <a href="#comments" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300"><Icon name="message" className="size-4" />{blog.comments.length} comments</a>
        </div>
        <span className="text-xs text-zinc-400">Enjoyed the read? Join the conversation.</span>
      </div>
      <section ref={commentsSection} id="comments" aria-labelledby="comments-heading" className="scroll-mt-24 space-y-5">
        <h2 id="comments-heading" className="text-xl font-semibold">Comments ({blog.comments.length})</h2>
        <form onSubmit={submit} className="rounded-xl border border-white/10 bg-[#121317] p-5">
          <label htmlFor="blog-comment" className="text-sm font-semibold">Join the discussion</label>
          <textarea id="blog-comment" required maxLength={2000} rows={4} value={comment} onChange={event => { setComment(event.target.value); setNotice('') }} placeholder="Share your thoughts or ask a question…" aria-describedby="comment-help" className="mt-3 w-full resize-y rounded-lg border border-white/10 bg-[#0c0d10] p-4 text-sm leading-6 focus:outline-violet-400" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p id="comment-help" className="text-xs text-zinc-400">Commenting as You · {comment.length}/2,000</p><button type="submit" disabled={!comment.trim()} className="rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-semibold hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">Post comment</button></div>
          <p role="status" className="mt-3 text-sm text-violet-300">{notice}</p>
        </form>
        {blog.comments.map(item => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-[#121317] p-5">
            <div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-violet-300">{item.author.split(' ').map(name => name[0]).join('')}</span><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"><span className="font-medium text-zinc-200">{item.author}</span><time dateTime={item.publishedAt} className="text-zinc-400">{formatBlogDate(item.publishedAt)}</time></div></div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{item.body}</p>
          </article>
        ))}
        {!blog.comments.length && <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">Be the first to share a thought. What stood out to you?</p>}
        <p className="text-xs text-zinc-400">Sample community · articles, likes, and comments reset on reload.</p>
      </section>
    </div>
  )
}

export default function BlogDetails() {
  const { id } = useParams()
  const blog = useBlogs().find(item => item.id === id)
  if (!blog) return (
    <section className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#121317] p-8 text-center">
      <Icon name="book" className="mx-auto mb-5 size-10 text-violet-400" /><h1>Blog not found</h1>
      <p className="mt-4 text-sm leading-6 text-zinc-400">This article is unavailable. Articles published in this demo reset on reload.</p>
      <Link to="/blogs" className="mt-6 inline-block text-violet-300">Browse blogs →</Link>
    </section>
  )
  return <Article key={blog.id} blog={blog} />
}
