import Icon from '../../../components/Icon'

export default function ChatHeader({ channel, member, onOpenChannels, onOpenMembers }) {
  const isDirectMessage = !channel

  return (
    <header className="flex shrink-0 items-start gap-2 border-b border-white/5 bg-[#101115] px-3 py-4 sm:gap-3 sm:px-6 sm:py-5">
      <button type="button" onClick={onOpenChannels} aria-label="Open channel list" className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 md:hidden"><Icon name="menu" className="size-4" /></button>
      <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-violet-400 sm:flex"><Icon name={isDirectMessage ? 'message' : 'hash'} className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <h1 className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">{channel ? `# ${channel.name}` : member?.name || 'Direct message'}</h1>
        <p className="mt-1 text-[11px] leading-5 text-zinc-500 sm:text-xs">{channel ? channel.description : `Your direct conversation with ${member?.name || 'a community member'}`}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-500 sm:text-[11px]">
          {channel ? (
            <>
              <span className="inline-flex items-center gap-1.5"><Icon name="users" className="size-3" />{channel.memberCount.toLocaleString()} members</span>
              <span aria-hidden="true" className="text-zinc-700">•</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-400" />{channel.onlineCount.toLocaleString()} online</span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${member?.online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />{member?.online ? 'Online' : 'Offline'}</span>
              {member && <><span aria-hidden="true" className="text-zinc-700">•</span><span>{member.reputation.toLocaleString()} reputation</span></>}
            </>
          )}
        </div>
      </div>
      <button type="button" onClick={onOpenMembers} aria-label="Open member list" className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 lg:hidden"><Icon name="users" className="size-4" /></button>
    </header>
  )
}
