const styles = {
  Easy: 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--success)]',
  Medium: 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--warning)]',
  Hard: 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--danger)]',
}

export default function DifficultyBadge({ difficulty }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[difficulty] || styles.Medium}`}>{difficulty}</span>
}
