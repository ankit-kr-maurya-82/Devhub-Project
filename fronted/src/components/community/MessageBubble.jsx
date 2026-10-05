import Icon from '../../../components/Icon.jsx'

const defaultReactions = ['👍', '🔥', '💜']

export default function MessageBubble({ message, author, currentUserId, onReact }) {
  const member = author || { name: 'Community member', initials: '?' }
  const timestamp = new Date(message.createdAt)
  const reactions = message.reactions || []
  const reactionEmojis = [...new Set([...reactions.map((reaction) => reaction.emoji), ...defaultReactions])]

  return (
    <article className="group flex min-w-0 gap-3 rounded-xl px-1 py-4 sm:px-3">
      <div aria-hidden="true" className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)] sm:size-10">
        {member.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-[var(--text)]">{member.name}</span>
          {message.authorId === currentUserId && <span className="text-xs font-medium text-[var(--muted)]">you</span>}
          <time dateTime={message.createdAt} title={timestamp.toLocaleString()} className="text-xs text-[var(--muted)]">
            {timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </time>
        </div>
        {message.text && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--text)] [overflow-wrap:anywhere]">{message.text}</p>}
        {message.code?.content && (
          <div className="mt-3 min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
              <Icon name="code" className="size-3.5" />
              <span>{message.code.language || 'text'}</span>
              <span className="ml-auto text-[var(--muted)]">Code snippet</span>
            </div>
            <pre tabIndex={0} aria-label={`${message.code.language || 'Plain text'} code snippet`} className="max-h-80 overflow-auto p-3 font-mono text-sm leading-6 text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] sm:p-4">
              <code>{message.code.content}</code>
            </pre>
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label={`Reactions to ${member.name}'s message`}>
          {reactionEmojis.map((emoji) => {
            const reaction = reactions.find((item) => item.emoji === emoji)
            const count = reaction?.count || 0
            return (
              <button key={emoji} type="button" onClick={() => onReact(message.id, emoji)} aria-pressed={Boolean(reaction?.reacted)} aria-label={`${reaction?.reacted ? 'Remove' : 'Add'} ${emoji} reaction, ${count} ${count === 1 ? 'reaction' : 'reactions'}`} className={`flex min-h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${reaction?.reacted ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface-raised)]'}`}>
                <span aria-hidden="true">{emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </article>
  )
}
