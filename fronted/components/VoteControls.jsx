export default function VoteControls({ votes, userVote, onVote, label }) {
  return (
    <div role="group" aria-label={`Vote on ${label}`} className="flex shrink-0 flex-col items-center gap-2">
      <button type="button" aria-label={`Upvote ${label}`} aria-pressed={userVote === 1} onClick={() => onVote(1)} className={`size-10 rounded-lg border ${userVote === 1 ? 'border-violet-400 bg-violet-500/20 text-violet-300' : 'border-white/10 text-zinc-500 hover:text-violet-300'}`}>▲</button>
      <span className="text-lg font-semibold text-zinc-200" aria-live="polite">{votes}</span>
      <button type="button" aria-label={`Downvote ${label}`} aria-pressed={userVote === -1} onClick={() => onVote(-1)} className={`size-10 rounded-lg border ${userVote === -1 ? 'border-violet-400 bg-violet-500/20 text-violet-300' : 'border-white/10 text-zinc-500 hover:text-violet-300'}`}>▼</button>
    </div>
  )
}
