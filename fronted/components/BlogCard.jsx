import { Link } from 'react-router-dom'
import { formatBlogDate } from '../data/blogs'
import BlogCover from './BlogCover'
import Icon from './Icon'
import TagBadge from './TagBadge'

export default function BlogCard({ blog, selectedTag, onTagSelect }) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--accent)]">
      <Link to={`/blogs/${blog.id}`} aria-label={`Read ${blog.title}`} className="block focus-visible:-outline-offset-4">
        <BlogCover category={blog.category} icon={blog.icon} accent={blog.accent} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5"><Icon name="clock" className="size-3.5" />{blog.readingTime}</span>
          {blog.featured && <span className="text-[var(--accent)]">Featured</span>}
        </div>
        <h3 className="break-words text-lg font-semibold leading-7 tracking-tight">
          <Link to={`/blogs/${blog.id}`} className="hover:text-[var(--accent)]">{blog.title}</Link>
        </h3>
        <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-[var(--muted)]">{blog.description}</p>
        <div className="mb-5 mt-4 flex flex-wrap gap-2">
          {blog.tags.map(tag => onTagSelect ? (
            <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={onTagSelect} />
          ) : (
            <Link key={tag} to={`/blogs?tag=${encodeURIComponent(tag)}`} className="max-w-full break-words rounded-md bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)]">{tag}</Link>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-4 text-xs">
          <p className="break-words font-medium text-[var(--text)]">{blog.author}</p>
          <time dateTime={blog.publishedAt} className="text-[var(--muted)]">{formatBlogDate(blog.publishedAt)}</time>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5"><Icon name="heart" className={`size-3.5 ${blog.liked ? 'fill-current text-[var(--accent)]' : ''}`} />{blog.likes} likes</span>
          <Link to={`/blogs/${blog.id}#comments`} className="flex items-center gap-1.5 hover:text-[var(--accent)]"><Icon name="message" className="size-3.5" />{blog.comments.length} comments</Link>
        </div>
      </div>
    </article>
  )
}
