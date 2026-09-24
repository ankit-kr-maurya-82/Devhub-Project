import { Link } from 'react-router-dom'
import TagBadge from './TagBadge'

export default function QuestionCard({ question, selectedTag, onTagSelect }) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#121317] p-5 transition-colors hover:border-violet-400/25 sm:p-6">
      <div className="flex gap-4 sm:gap-6">
        <div className="hidden w-14 shrink-0 self-start rounded-lg border border-violet-400/15 bg-violet-400/5 py-3 text-center sm:block">
          <span aria-hidden="true" className="text-xs text-violet-400">▲</span>
          <p className="mt-1 text-lg font-semibold text-violet-200">{question.votes}</p>
          <p className="text-[10px] text-zinc-500">votes</p>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold leading-6 tracking-tight text-zinc-100"><Link to={`/questions/${question.id}`} className="hover:text-violet-300">{question.title}</Link></h3>
          <p className="mt-2 break-words text-sm leading-6 text-zinc-400">{question.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{question.tags.map(tag => <TagBadge key={tag} tag={tag} selected={selectedTag === tag} onSelect={onTagSelect} />)}</div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-white/5 pt-4 text-xs text-zinc-500">
            <div className="flex flex-wrap gap-3"><span className="text-violet-300 sm:hidden">{question.votes} votes</span><span className="text-emerald-400">{question.answers} answers</span><span>{question.views} views</span></div>
            <div className="flex flex-wrap items-center gap-2"><span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-violet-400/10 text-[10px] font-semibold text-violet-300">{question.username[0].toUpperCase()}</span><span className="text-zinc-300">{question.username}</span><span>{question.reputation?.toLocaleString()} reputation</span><span>· {question.time}</span></div>
          </div>
        </div>
      </div>
    </article>
  )
}
