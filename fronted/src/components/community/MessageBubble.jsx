import Icon from '../../../components/Icon.jsx'

const defaultReactions = ['👍', '🔥', '💜']

export default function MessageBubble({ message, author, currentUserId, onReact }) {
  const member = author || { name: 'Community member', initials: '?', reputation: 0, avatarClass: 'bg-zinc-800 text-zinc-300' }
  const timestamp = new Date(message.createdAt)
  const reactions = message.reactions || []
  const reactionEmojis = [...new Set([...reactions.map((reaction) => reaction.emoji), ...defaultReactions])]

  return (
    <article className="group flex min-w-0 gap-3 rounded-xl px-1 py-4 sm:px-3">
      <div aria-hidden="true" className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold sm:size-10 ${member.avatarClass}`}>
        {member.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-zinc-100">{member.name}</span>
          {message.authorId === currentUserId && <span className="text-[10px] font-medium text-zinc-500">you</span>}
          <span className="rounded-md border border-amber-400/10 bg-amber-400/5 px-1.5 py-0.5 text-[10px] font-medium text-amber-300" aria-label={`${member.reputation.toLocaleString()} reputation`}>
            <span aria-hidden="true">✦ </span>{member.reputation.toLocaleString()}
          </span>
          <time dateTime={message.createdAt} title={timestamp.toLocaleString()} className="text-[11px] text-zinc-500">
            {timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </time>
        </div>
        {message.text && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">{message.text}</p>}
        {message.code?.content && (
          <div className="mt-3 min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0c0d10]">
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-[11px] text-zinc-500">
              <Icon name="code" className="size-3.5" />
              <span>{message.code.language || 'text'}</span>
              <span className="ml-auto text-zinc-600">Code snippet</span>
            </div>
            <pre tabIndex={0} aria-label={`${message.code.language || 'Plain text'} code snippet`} className="max-h-80 overflow-auto p-3 font-mono text-xs leading-6 text-violet-200 focus-visible:outline-2 focus-visible:outline-violet-400 sm:p-4">
              <code>{message.code.content}</code>
            </pre>
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label={`Reactions to ${member.name}'s message`}>
          {reactionEmojis.map((emoji) => {
            const reaction = reactions.find((item) => item.emoji === emoji)
            const count = reaction?.count || 0
            return (
              <button key={emoji} type="button" onClick={() => onReact(message.id, emoji)} aria-pressed={Boolean(reaction?.reacted)} aria-label={`${reaction?.reacted ? 'Remove' : 'Add'} ${emoji} reaction, ${count} ${count === 1 ? 'reaction' : 'reactions'}`} className={`flex min-h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${reaction?.reacted ? 'border-violet-400/40 bg-violet-500/15 text-violet-200' : 'border-white/5 bg-white/[0.025] text-zinc-400 hover:border-white/15 hover:bg-white/5'}`}>
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
