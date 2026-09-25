import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge'

export default function ProblemCard({ problem }) {
  return (
    <article className="group rounded-xl border border-white/10 bg-[#121317] p-5 transition-colors hover:border-violet-400/30 sm:p-6">
      <div className="flex items-start gap-4">
        <span aria-label={problem.solved ? 'Solved' : 'Not solved'} title={problem.solved ? 'Solved' : 'Not solved'} className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs ${problem.solved ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/10 text-zinc-600'}`}>{problem.solved ? '✓' : '○'}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="break-words text-base font-semibold leading-6"><Link to={`/coding/problem/${problem.id}`} className="hover:text-violet-300">{problem.title}</Link></h2><p className="mt-1 text-xs text-zinc-500">{problem.solved ? 'Solved' : 'Ready to solve'}</p></div>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{problem.tags.map(tag => <span key={tag} className="max-w-full break-all rounded-md bg-white/5 px-2.5 py-1 font-mono text-[11px] text-zinc-400">{tag}</span>)}</div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs text-zinc-400"><div className="flex flex-wrap gap-4"><span><strong className="font-medium text-zinc-200">{problem.acceptance}%</strong> acceptance</span><span><strong className="font-medium text-zinc-200">{problem.submissions.toLocaleString('en-US')}</strong> submissions</span></div><Link to={`/coding/problem/${problem.id}`} className="font-medium text-violet-300 group-hover:text-violet-200">Open problem <span aria-hidden="true">→</span></Link></div>
        </div>
      </div>
    </article>
  )
}
