import { Fragment, useEffect, useMemo, useRef } from 'react'
import Icon from '../../../components/Icon.jsx'
import MessageBubble from './MessageBubble.jsx'

export default function MessageList({ messages, members, currentUserId, onReact, conversationName }) {
  const scrollRef = useRef(null)
  const orderedMessages = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [messages])
  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members])
  const newestMessageId = orderedMessages.at(-1)?.id

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [conversationName, newestMessageId])

  return (
    <div ref={scrollRef} role="log" aria-label={`Messages in ${conversationName}`} aria-live="polite" aria-relevant="additions" tabIndex={0} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-400 sm:px-5">
      {orderedMessages.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-400"><Icon name="message" /></div>
          <h2 className="text-base font-semibold text-zinc-200">Start the conversation</h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">Say hello, share an idea, or ask a question in {conversationName}.</p>
        </div>
      ) : orderedMessages.map((message, index) => {
        const date = new Date(message.createdAt)
        const previousDate = index > 0 ? new Date(orderedMessages[index - 1].createdAt) : null
        const startsDay = !previousDate || date.toDateString() !== previousDate.toDateString()

        return (
          <Fragment key={message.id}>
            {startsDay && (
              <div className="my-3 flex items-center gap-3" aria-label={`Messages from ${date.toLocaleDateString()}`}>
                <div className="h-px flex-1 bg-white/5" />
                <span className="shrink-0 text-[10px] font-medium tracking-wide text-zinc-500">{date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            )}
            <MessageBubble message={message} author={memberMap.get(message.authorId)} currentUserId={currentUserId} onReact={onReact} />
          </Fragment>
        )
      })}
    </div>
  )
}
