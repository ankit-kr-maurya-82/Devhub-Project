import { topTags } from '../data/developer'

export default function TopTags() {
  return (
    <ol className="space-y-5">
      {topTags.map((tag, index) => (
        <li key={tag.name}>
          <div className="mb-2 flex items-center justify-between gap-4 text-xs"><span className="font-mono text-zinc-300"><span className="mr-3 text-zinc-600">0{index + 1}</span>{tag.name}</span><span className="tabular-nums text-zinc-400">{tag.count}<span className="sr-only"> contributions</span></span></div>
          <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-violet-400/70" style={{ width: `${tag.count / topTags[0].count * 100}%` }} /></div>
        </li>
      ))}
    </ol>
  )
}
