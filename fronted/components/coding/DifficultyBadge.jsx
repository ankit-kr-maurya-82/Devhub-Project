const styles = {
  easy: 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--success)]',
  medium: 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--warning)]',
  hard: 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--danger)]',
}

export default function DifficultyBadge({ difficulty }) {
  const normalized = String(difficulty || 'medium').toLowerCase()
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1)
  return <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[normalized] || styles.medium}`}>{label}</span>
}
