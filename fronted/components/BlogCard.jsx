import { Link } from 'react-router-dom'
import { formatBlogDate } from '../data/blogs'
import BlogCover from './BlogCover'
import Icon from './Icon'
import TagBadge from './TagBadge'

export default function BlogCard({ blog, selectedTag, onTagSelect }) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#121317] transition-colors hover:border-violet-400/40">
      <Link to={`/blogs/${blog.id}`} aria-label={`Read ${blog.title}`} className="block focus-visible:-outline-offset-4">
        <BlogCover category={blog.category} icon={blog.icon} accent={blog.accent} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5"><Icon name="clock" className="size-3.5" />{blog.readingTime}</span>
          {blog.featured && <span className="text-violet-300">Featured</span>}
        </div>
        <h3 className="break-words text-lg font-semibold leading-7 tracking-tight">
          <Link to={`/blogs/${blog.id}`} className="hover:text-violet-300">{blog.title}</Link>
        </h3>
        <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-zinc-400">{blog.description}</p>
        <div className="mb-5 mt-4 flex flex-wrap gap-2">
          {blog.tags.map(tag => onTagSelect ? (
            <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={onTagSelect} />
          ) : (
            <Link key={tag} to={`/blogs?tag=${encodeURIComponent(tag)}`} className="max-w-full break-all rounded-md bg-white/5 px-2.5 py-1 font-mono text-[11px] text-zinc-400 hover:text-violet-300">{tag}</Link>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2.5 border-t border-white/5 pt-4">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[10px] text-violet-300">{blog.author.split(' ').map(name => name[0]).join('')}</span>
          <div className="min-w-0"><p className="text-xs font-medium text-zinc-300">{blog.author}</p><time dateTime={blog.publishedAt} className="mt-1 block text-[11px] text-zinc-400">{formatBlogDate(blog.publishedAt)}</time></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5"><Icon name="heart" className={`size-3.5 ${blog.liked ? 'fill-violet-400 text-violet-400' : ''}`} />{blog.likes} likes</span>
          <Link to={`/blogs/${blog.id}#comments`} className="flex items-center gap-1.5 hover:text-violet-300"><Icon name="message" className="size-3.5" />{blog.comments.length} comments</Link>
        </div>
      </div>
    </article>
  )
}
