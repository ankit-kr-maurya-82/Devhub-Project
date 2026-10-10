import ChannelList from './ChannelList'
import DirectMessages from './DirectMessages'

export default function CommunitySidebar({ channels, contacts, members, activeConversation, onSelectChannel, onSelectDirectMessage, currentUser }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <ChannelList channels={channels} activeChannelId={activeConversation.type === 'channel' ? activeConversation.id : null} onSelectChannel={onSelectChannel} />
        <DirectMessages contacts={contacts} members={members} activeMemberId={activeConversation.type === 'dm' ? activeConversation.id : null} onSelectDirectMessage={onSelectDirectMessage} />
      </div>
      {currentUser && (
        <div className="flex shrink-0 items-center gap-3 border-t border-[var(--border)] bg-[var(--surface-raised)] px-5 py-4">
          <span className="relative shrink-0">
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">{currentUser.initials}</span>
            <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[var(--surface)] ${currentUser.online ? 'bg-[var(--success)]' : 'bg-[var(--subtle)]'}`} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text)]">{currentUser.name} <span className="ml-1 text-xs font-normal text-[var(--muted)]">(you)</span></p>
            <p className="mt-1 text-xs text-[var(--muted)]">Signed in</p>
          </div>
        </div>
      )}
    </div>
  )
}
