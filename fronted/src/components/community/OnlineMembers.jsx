import Icon from '../../../components/Icon'

function MemberGroup({ title, members, online }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500"><span className={`size-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />{title}<span className="ml-auto font-normal tracking-normal text-zinc-600">{members.length}</span></h3>
      <ul className="space-y-1">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 rounded-lg px-1 py-2">
            <span className="relative shrink-0">
              <span aria-hidden="true" className={`flex size-8 items-center justify-center rounded-lg text-[11px] font-semibold ${member.avatarClass || 'bg-violet-500/15 text-violet-300'} ${online ? '' : 'opacity-60'}`}>{member.initials}</span>
              <span aria-label={online ? 'Online' : 'Offline'} className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#101115] ${online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs font-medium ${online ? 'text-zinc-300' : 'text-zinc-500'}`}>{member.name}</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">{member.reputation.toLocaleString()} reputation</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function OnlineMembers({ members }) {
  const onlineMembers = members.filter((member) => member.online)
  const offlineMembers = members.filter((member) => !member.online)

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#101115]">
      <div className="shrink-0 border-b border-white/5 px-5 py-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200"><Icon name="users" className="size-4 text-zinc-500" />Members</h2>
        <p className="mt-1.5 text-[10px] text-zinc-500">{members.length} sample community members</p>
      </div>
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5">
        <MemberGroup title="Online" members={onlineMembers} online />
        <MemberGroup title="Offline" members={offlineMembers} online={false} />
        <div className="rounded-xl border border-violet-400/10 bg-violet-500/5 p-3.5">
          <p className="text-[11px] font-medium text-violet-300">Good conversations start here.</p>
          <p className="mt-1.5 text-[10px] leading-5 text-zinc-500">Share what you know, ask what you don’t, and help someone build something great.</p>
        </div>
      </div>
    </div>
  )
}
