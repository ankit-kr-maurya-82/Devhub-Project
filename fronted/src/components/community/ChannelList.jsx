import Icon from '../../../components/Icon'

export default function ChannelList({ channels, activeChannelId, onSelectChannel }) {
  return (
    <nav aria-label="Community channels">
      <div className="mb-2 flex items-center justify-between px-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Channels</h2>
        <span className="text-[10px] text-zinc-600">{channels.length}</span>
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
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${isActive ? 'bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/20' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}`}
              >
                <Icon name="hash" className={`size-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-zinc-600'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{channel.name}</span>
                  <span className={`mt-0.5 block text-[10px] ${isActive ? 'text-violet-300/60' : 'text-zinc-600'}`}>{channel.memberCount.toLocaleString()} members</span>
                </span>
                {channel.unreadCount > 0 && (
                  <span aria-label={`${channel.unreadCount} unread messages`} className={`min-w-5 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[10px] font-semibold ${isActive ? 'bg-violet-400/20 text-violet-200' : 'bg-zinc-800 text-zinc-300'}`}>
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
