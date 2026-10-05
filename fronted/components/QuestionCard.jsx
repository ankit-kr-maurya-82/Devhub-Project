import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'

export default function QuestionCard({ question, selectedTag, onTagSelect }) {
  return (
    <article className="ui-card p-5 transition-colors hover:border-[var(--accent)] sm:p-6">
      <h3 className="break-words text-base font-semibold leading-6 text-[var(--text)]"><Link to={`/questions/${question.id}`} className="hover:text-[var(--accent)]">{question.title}</Link></h3>
      <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[var(--muted)]">{question.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">{question.tags.map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={onTagSelect} />)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
        <div className="flex flex-wrap gap-3"><span>{question.votes} votes</span><span className={question.answers > 0 ? 'font-medium text-[var(--success)]' : ''}>{question.answers} {question.answers === 1 ? 'answer' : 'answers'}</span><span>{question.views} views</span></div>
        <p className="break-words">{question.username}<span className="mx-1.5">·</span>{question.time}</p>
      </div>
    </article>
  )
}
