export default function DirectMessages({ contacts, members, activeMemberId, onSelectDirectMessage }) {
  if (!contacts.length) return null
  return (
    <nav aria-label="Direct messages" className="mt-6">
      <h2 className="mb-2 px-3 text-xs font-semibold  text-[var(--muted)]">Direct messages</h2>
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
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-inset ring-[var(--border)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}
              >
                <span className="relative shrink-0">
                  <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">{member.initials}</span>
                  <span aria-label={member.online ? 'Online' : 'Offline'} className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[var(--surface)] ${member.online ? 'bg-[var(--success)]' : 'bg-[var(--subtle)]'}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{member.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{contact.preview || 'Start a conversation'}</span>
                </span>
                {contact.unreadCount > 0 && <span aria-label={`${contact.unreadCount} unread messages`} className="min-w-5 rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-center text-xs font-semibold text-[var(--accent)]">{contact.unreadCount > 99 ? '99+' : contact.unreadCount}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
