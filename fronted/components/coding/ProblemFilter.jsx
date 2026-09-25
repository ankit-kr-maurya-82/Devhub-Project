const filters = ['All', 'Easy', 'Medium', 'Hard', 'Solved', 'Unsolved']

export default function ProblemFilter({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter coding problems" className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#121317] p-1.5">
      {filters.map(filter => <button key={filter} type="button" aria-pressed={value === filter} onClick={() => onChange(filter)} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${value === filter ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>{filter}</button>)}
    </div>
  )
}
