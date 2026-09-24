import { Link } from 'react-router-dom'
import Icon from './Icon'
import TagBadge from './TagBadge'

const accents = {
  violet: 'from-violet-500/15 to-violet-500/0 text-violet-300',
  emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-300',
  amber: 'from-amber-500/15 to-amber-500/0 text-amber-300',
}

export default function BlogCard({ blog, selectedTag, onTagSelect }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#121317] transition-colors hover:border-violet-400/30">
      <div className={`flex items-center justify-between border-b border-white/5 bg-gradient-to-br px-5 py-6 ${accents[blog.accent]}`}><span className="font-mono text-[10px] tracking-widest">{blog.category}</span><Icon name={blog.icon} className="size-7 opacity-70" /></div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-3 text-xs text-zinc-500">{blog.readingTime}</p>
        <h3 className="text-base font-semibold leading-6 tracking-tight"><Link to={`/blogs/${blog.id}`} className="hover:text-violet-300">{blog.title}</Link></h3>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{blog.description}</p>
        <div className="mb-5 mt-4 flex flex-wrap gap-2">{blog.tags.map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={onTagSelect} />)}</div>
        <div className="mt-auto flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-zinc-300"><span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-violet-300">{blog.author.split(' ').map(name => name[0]).join('')}</span>{blog.author}</div>
      </div>
    </article>
  )
}
