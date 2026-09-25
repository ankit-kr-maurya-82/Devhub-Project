import Icon from '../../../components/Icon'
import ChannelList from './ChannelList'
import DirectMessages from './DirectMessages'

export default function CommunitySidebar({ channels, contacts, members, activeConversation, onSelectChannel, onSelectDirectMessage, currentUser }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#101115]">
      <div className="shrink-0 border-b border-white/5 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-400"><Icon name="users" className="size-4" /></span>
          <div>
            <p className="text-sm font-semibold text-zinc-100">DevHub Community</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">A space for curious developers</p>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <ChannelList channels={channels} activeChannelId={activeConversation.type === 'channel' ? activeConversation.id : null} onSelectChannel={onSelectChannel} />
        <DirectMessages contacts={contacts} members={members} activeMemberId={activeConversation.type === 'dm' ? activeConversation.id : null} onSelectDirectMessage={onSelectDirectMessage} />
      </div>
      {currentUser && (
        <div className="flex shrink-0 items-center gap-3 border-t border-white/5 bg-black/10 px-5 py-4">
          <span className="relative shrink-0">
            <span aria-hidden="true" className={`flex size-9 items-center justify-center rounded-xl text-xs font-semibold ${currentUser.avatarClass || 'bg-violet-500/15 text-violet-300'}`}>{currentUser.initials}</span>
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#101115] bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-zinc-200">{currentUser.name} <span className="ml-1 text-[10px] font-normal text-zinc-500">(you)</span></p>
            <p className="mt-1 text-[10px] text-zinc-500">Online <span className="mx-1 text-zinc-700">·</span> {currentUser.reputation.toLocaleString()} reputation</p>
          </div>
        </div>
      )}
    </div>
  )
}
