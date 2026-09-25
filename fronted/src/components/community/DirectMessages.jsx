export default function DirectMessages({ contacts, members, activeMemberId, onSelectDirectMessage }) {
  return (
    <nav aria-label="Direct messages" className="mt-6">
      <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Direct messages</h2>
      <ul className="space-y-1">
        {contacts.map((contact) => {
          const member = members.find((entry) => entry.id === contact.memberId)
          if (!member) return null
          const isActive = member.id === activeMemberId
          return (
            <li key={member.id}>
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectDirectMessage(member.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${isActive ? 'bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/20' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}`}
              >
                <span className="relative shrink-0">
                  <span aria-hidden="true" className={`flex size-8 items-center justify-center rounded-lg text-[11px] font-semibold ${member.avatarClass || 'bg-violet-500/15 text-violet-300'}`}>{member.initials}</span>
                  <span aria-label={member.online ? 'Online' : 'Offline'} className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#101115] ${member.online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{member.name}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-zinc-600">{contact.preview || 'Start a conversation'}</span>
                </span>
                {contact.unreadCount > 0 && <span aria-label={`${contact.unreadCount} unread messages`} className="min-w-5 rounded-md bg-violet-500/20 px-1.5 py-0.5 text-center text-[10px] font-semibold text-violet-300">{contact.unreadCount > 99 ? '99+' : contact.unreadCount}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
