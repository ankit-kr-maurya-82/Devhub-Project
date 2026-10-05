const filters = ['All', 'Easy', 'Medium', 'Hard', 'Solved', 'Unsolved']

export default function ProblemFilter({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter coding problems" className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5">
      {filters.map(filter => <button key={filter} type="button" aria-pressed={value === filter} onClick={() => onChange(filter)} className={`min-h-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${value === filter ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}>{filter}</button>)}
    </div>
  )
}
