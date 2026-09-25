export default function TagBadge({ tag, selected = false, onSelect }) {
  const className = `max-w-full break-all rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${selected ? 'border-violet-400/50 bg-violet-500/20 text-violet-200' : 'border-white/5 bg-white/5 text-zinc-400 hover:border-violet-400/40 hover:text-violet-300'}`
  if (!onSelect) return <span className={className}>{tag}</span>
  return (
    <button type="button" onClick={() => onSelect(tag)} aria-pressed={selected}
      className={className}>
      {tag}
    </button>
  )
}
