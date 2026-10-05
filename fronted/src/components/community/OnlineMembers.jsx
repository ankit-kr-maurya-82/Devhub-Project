import Icon from '../../../components/Icon'

function MemberGroup({ title, members, online }) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold  text-[var(--muted)]"><span className={`size-1.5 rounded-full ${online ? 'bg-[var(--success)]' : 'bg-[var(--subtle)]'}`} />{title}<span className="ml-auto font-normal tracking-normal text-[var(--muted)]">{members.length}</span></h3>
      <ul className="space-y-1">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 rounded-lg px-1 py-2">
            <span className="relative shrink-0">
              <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">{member.initials}</span>
              <span aria-label={online ? 'Online' : 'Offline'} className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[var(--surface)] ${online ? 'bg-[var(--success)]' : 'bg-[var(--subtle)]'}`} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${online ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>{member.name}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{member.reputation.toLocaleString()} reputation</p>
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
    <div className="flex h-full min-h-0 flex-col bg-[var(--surface)]">
      <div className="shrink-0 border-b border-[var(--border)] px-5 py-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]"><Icon name="users" className="size-4 text-[var(--muted)]" />Members</h2>
        <p className="mt-1.5 text-xs text-[var(--muted)]">{members.length} sample community members</p>
      </div>
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5">
        <MemberGroup title="Online" members={onlineMembers} online />
        <MemberGroup title="Offline" members={offlineMembers} online={false} />
      </div>
    </div>
  )
}
