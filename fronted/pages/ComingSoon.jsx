import { Link } from 'react-router-dom'

export default function ComingSoon({ title, description }) {
  return <section className="max-w-2xl"><p className="mb-3 font-mono text-xs tracking-widest text-violet-400">EXPLORE DEVHUB</p><h1>{title}</h1><p className="mt-3 text-zinc-400">{description}</p><div className="mt-8 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-8"><span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">Coming soon</span><p className="mt-4 text-sm text-zinc-400">This space is still taking shape. In the meantime, join a discussion.</p><Link to="/questions" className="mt-6 inline-block text-sm font-medium text-violet-300 hover:text-violet-200">Explore questions →</Link></div></section>
}
