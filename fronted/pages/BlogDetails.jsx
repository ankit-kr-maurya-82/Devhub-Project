import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addBlogComment, toggleBlogLike, useBlogs } from '../hooks/useBlogs'
import { formatBlogDate } from '../data/blogs'
import BlogContent from '../components/BlogContent'

function Article({ blog }) {
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!comment.trim()) { setNotice('Write a comment before posting.'); return }
    addBlogComment(blog.id, comment)
    setComment('')
    setNotice('Your comment was added to this demo discussion.')
  }
  return <div className="mx-auto max-w-3xl space-y-7">
    <Link to="/blogs" className="inline-block text-sm text-violet-300">← All blogs</Link>
    <header><p className="mb-3 font-mono text-xs tracking-widest text-violet-400">{blog.category}</p><h1 className="break-words leading-tight">{blog.title}</h1><div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-400"><span className="flex size-10 items-center justify-center rounded-full bg-violet-500/15 text-violet-300" aria-hidden="true">{blog.author.split(' ').map(name => name[0]).join('')}</span><span className="text-zinc-200">{blog.author}</span><time dateTime={blog.publishedAt}>{formatBlogDate(blog.publishedAt)}</time><span>· {blog.readingTime}</span></div><div className="mt-5 flex flex-wrap gap-2">{blog.tags.map(tag => <Link key={tag} to={`/blogs?tag=${encodeURIComponent(tag)}`} className="rounded-md bg-violet-500/10 px-3 py-1 font-mono text-xs text-violet-300">{tag}</Link>)}</div></header>
    <div aria-label="Cover image placeholder" className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/20 to-[#121317] text-violet-300 sm:h-60"><span aria-hidden="true" className="font-mono text-5xl">&lt;/&gt;</span><span className="text-xs text-zinc-500">DevHub · cover placeholder</span></div>
    <article className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-8"><BlogContent content={blog.content} /></article>
    <div className="flex flex-wrap items-center gap-5 border-y border-white/10 py-4"><button onClick={() => toggleBlogLike(blog.id)} aria-pressed={blog.liked} className={`rounded-lg border px-4 py-2 text-sm ${blog.liked ? 'border-violet-400/40 bg-violet-500/20 text-violet-300' : 'border-white/10 text-zinc-300'}`}>{blog.liked ? '♥ Liked' : '♡ Like'} · {blog.likes}</button><a href="#comments" className="text-sm text-zinc-400">{blog.comments.length} comments</a></div>
    <section id="comments" aria-labelledby="comments-heading" className="space-y-4"><h2 id="comments-heading" className="text-xl font-semibold">Comments ({blog.comments.length})</h2>{blog.comments.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-[#121317] p-5"><div className="flex flex-wrap gap-3 text-xs"><span className="font-medium text-zinc-200">{item.author}</span><time dateTime={item.publishedAt} className="text-zinc-500">{formatBlogDate(item.publishedAt)}</time></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-400">{item.body}</p></article>)}{!blog.comments.length && <p className="text-sm text-zinc-500">Start the conversation. What stood out to you?</p>}
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-[#121317] p-5"><label htmlFor="blog-comment" className="font-semibold">Join the discussion</label><textarea id="blog-comment" required maxLength={2000} rows={4} value={comment} onChange={event => setComment(event.target.value)} placeholder="Share your thoughts…" className="mt-4 w-full rounded-lg border border-white/10 bg-[#0c0d10] p-4 text-sm focus:outline-violet-400" /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-zinc-500">Local demo only · changes reset on reload.</p><button className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Post comment</button></div><p role="status" className="mt-3 text-sm text-violet-300">{notice}</p></form></section>
  </div>
}

export default function BlogDetails() {
  const { id } = useParams()
  const blog = useBlogs().find(item => item.id === id)
  if (!blog) return <section className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#121317] p-8"><h1>Blog not found</h1><p className="mt-4 text-zinc-400">This article does not exist in the current demo. Locally published articles reset on reload.</p><Link to="/blogs" className="mt-6 inline-block text-violet-300">Browse blogs →</Link></section>
  return <Article key={blog.id} blog={blog} />
}
