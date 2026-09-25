import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#121317] px-6 py-14 text-center sm:px-10">
      <Icon name="search" className="mx-auto mb-6 size-10 text-violet-400" />
      <p className="mb-3 font-mono text-xs tracking-widest text-violet-400">404 · PAGE NOT FOUND</p>
      <h1>That page isn’t here.</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-400">The address may be incorrect, or the page may have moved. There’s still plenty to explore on DevHub.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/" className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Back to home</Link><Link to="/questions" className="rounded-lg border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:bg-white/5">Explore questions</Link></div>
    </section>
  )
}
