import Icon from '../../../components/Icon'

export default function ChannelList({ channels, activeChannelId, onSelectChannel }) {
  return (
    <nav aria-label="Community channels">
      <div className="mb-2 flex items-center justify-between px-3">
        <h2 className="text-xs font-semibold  text-[var(--muted)]">Channels</h2>
        <span className="text-xs text-[var(--muted)]">{channels.length}</span>
      </div>
      <ul className="space-y-1">
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId
          return (
            <li key={channel.id}>
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectChannel(channel.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-inset ring-[var(--border)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}
              >
                <Icon name="hash" className={`size-4 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{channel.name}</span>
                </span>
                {channel.unreadCount > 0 && (
                  <span aria-label={`${channel.unreadCount} unread messages`} className={`min-w-5 shrink-0 rounded-md px-1.5 py-0.5 text-center text-xs font-semibold ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--surface-raised)] text-[var(--text)]'}`}>
                    {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
