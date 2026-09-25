const styles = {
  Easy: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  Medium: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  Hard: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
}

export default function DifficultyBadge({ difficulty }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[difficulty] || styles.Medium}`}>{difficulty}</span>
}
