export default function TagBadge({ tag, selected = false, onSelect }) {
  const className = `max-w-full break-words rounded-md border px-2.5 py-1.5 text-xs transition-colors ${selected ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-medium text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`
  if (!onSelect) return <span className={className}>{tag}</span>
  return <button type="button" onClick={() => onSelect(tag)} aria-pressed={selected} className={className}>{tag}</button>
}
