import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'

export default function QuestionCard({ question, selectedTag, onTagSelect }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)] sm:p-5">
      <h3 className="min-w-0 break-words text-base font-semibold leading-6 text-[var(--text)]"><Link to={`/questions/${question.id}`} className="rounded-sm hover:text-[var(--accent)] focus-visible:outline">{question.title}</Link></h3>
      {question.description && <p className="mt-1.5 line-clamp-2 break-words text-sm leading-6 text-[var(--muted)]">{question.description}</p>}
      {!!question.tags.length && <div className="mt-3 flex flex-wrap gap-2">{question.tags.map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={onTagSelect} />)}</div>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
        <div className="flex flex-wrap gap-x-3 gap-y-1"><span>{question.votes} votes</span><span className={question.answers > 0 ? 'font-medium text-[var(--success)]' : ''}>{question.answers} {question.answers === 1 ? 'answer' : 'answers'}</span><span>{question.views} views</span></div>
        <p className="min-w-0 break-words">{question.username}<span className="mx-1.5" aria-hidden="true">·</span>{question.time}</p>
      </div>
    </article>
  )
}
