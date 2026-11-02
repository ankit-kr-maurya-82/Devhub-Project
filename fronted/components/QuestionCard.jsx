import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'
import Avatar from './Avatar'

export default function QuestionCard({ question, selectedTag, onTagSelect }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)] sm:p-5">
      <h3 className="min-w-0 break-words text-lg font-semibold leading-7 tracking-tight text-[var(--text)]"><Link to={`/questions/${question.id}`} className="rounded-sm hover:text-[var(--accent)] focus-visible:outline">{question.title}</Link></h3>
      {question.description && <p className="mt-1.5 line-clamp-2 break-words text-sm leading-6 text-[var(--muted)]">{question.description}</p>}
      {!!question.tags.length && <div className="mt-3 flex flex-wrap gap-2">{question.tags.map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={onTagSelect} />)}</div>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
        <div className="flex flex-wrap gap-x-3 gap-y-1"><span>{question.votes} votes</span><span className={question.answers > 0 ? 'font-medium text-[var(--success)]' : ''}>{question.answers} {question.answers === 1 ? 'answer' : 'answers'}</span><span>{question.views} views</span></div>
        <p className="flex min-w-0 items-center gap-2"><Avatar name={question.username} size="sm" /><span className="min-w-0 break-words font-medium text-[var(--text)]">{question.username}</span><span aria-hidden="true">·</span><time>{question.time}</time></p>
      </div>
    </article>
  )
}
