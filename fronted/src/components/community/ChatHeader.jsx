import Icon from '../../../components/Icon'

export default function ChatHeader({ channel, member, onOpenChannels, onOpenMembers }) {
  const isDirectMessage = !channel

  return (
    <header className="flex shrink-0 items-start gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-4 sm:gap-3 sm:px-6 sm:py-5">
      <button type="button" onClick={onOpenChannels} aria-label="Open channel list" className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text)] md:hidden"><Icon name="menu" className="size-4" /></button>
      <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent)] sm:flex"><Icon name={isDirectMessage ? 'message' : 'hash'} className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">{channel ? `# ${channel.name}` : member?.name || 'Direct message'}</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)] sm:text-sm">{channel ? channel.description : `Your direct conversation with ${member?.name || 'a community member'}`}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)] sm:text-xs">
          {channel ? (
            <span className="inline-flex items-center gap-1.5"><Icon name="users" className="size-3" />{channel.memberCount.toLocaleString()} members</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${member?.online ? 'bg-[var(--success)]' : 'bg-[var(--subtle)]'}`} />{member?.online ? 'Online' : 'Offline'}</span>
            </>
          )}
        </div>
      </div>
      <button type="button" onClick={onOpenMembers} aria-label="Open member list" className="mt-0.5 flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"><Icon name="users" className="size-4" /><span className="hidden sm:inline">Members</span></button>
    </header>
  )
}
