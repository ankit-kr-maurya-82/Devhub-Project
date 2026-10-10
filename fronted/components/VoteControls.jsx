export default function VoteControls({ votes, userVote, onVote, label, disabled = false }) {
  return (
    <div role="group" aria-label={`Vote on ${label}`} className="flex shrink-0 flex-col items-center gap-2">
      <button type="button" disabled={disabled} aria-label={`Upvote ${label}`} aria-pressed={userVote === 1} onClick={() => onVote(1)} className={`size-11 rounded-lg border disabled:cursor-not-allowed disabled:opacity-50 ${userVote === 1 ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)]'}`}>▲</button>
      <span className="text-lg font-semibold text-[var(--text)]" aria-live="polite">{votes}</span>
      <button type="button" disabled={disabled} aria-label={`Downvote ${label}`} aria-pressed={userVote === -1} onClick={() => onVote(-1)} className={`size-11 rounded-lg border disabled:cursor-not-allowed disabled:opacity-50 ${userVote === -1 ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)]'}`}>▼</button>
    </div>
  )
}
