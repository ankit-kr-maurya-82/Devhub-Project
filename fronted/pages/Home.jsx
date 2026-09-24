import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const shortcuts = [
  { to: '/questions', icon: 'message', title: 'Find your answer', text: 'Explore questions and learn something new.', action: 'Explore questions' },
  { to: '/blogs', icon: 'book', title: 'A fresh perspective', text: 'Make room for ideas, stories, and deep dives.', action: 'Discover blogs' },
  { to: '/coding-practice', icon: 'code', title: 'Keep getting better', text: 'Make practice a part of your developer journey.', action: 'Coding practice' },
]
export default function Home() {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-5 flex items-center gap-2 font-mono text-xs tracking-widest text-zinc-500"><span className="size-1.5 rounded-full bg-violet-400" />YOUR DEVELOPER WORKSPACE</p>
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-[#14141c] to-[#111216] p-6 sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-8 hidden rotate-12 font-mono text-[140px] font-bold text-violet-400/5 sm:block">&lt;/&gt;</div>
        <p className="mb-3 text-sm font-medium text-violet-300">Welcome to DevHub</p>
        <h1 className="relative max-w-xl leading-tight">A home for your<br /><span className="text-violet-400">developer curiosity.</span></h1>
        <p className="relative mt-5 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">Ask questions. Share what you know. Build your next big idea with a community of curious developers.</p>
        <div className="relative mt-7 flex flex-wrap gap-3"><Link to="/ask-question" className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-3 text-sm font-semibold hover:bg-violet-400"><Icon name="plus" className="size-4" />Ask a question</Link><Link to="/blogs" className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/10">Explore blogs →</Link></div>
      </section>
      <div className="mb-5 mt-10"><h2 className="text-lg font-semibold tracking-tight">Where will curiosity take you?</h2><p className="mt-1 text-sm text-zinc-500">A few good places to start.</p></div>
      <div className="grid gap-4 md:grid-cols-3">{shortcuts.map(({ to, icon, title, text, action }) => <Link key={to} to={to} className="group rounded-xl border border-white/10 bg-[#121317] p-6 transition-colors hover:border-violet-400/40 hover:bg-[#17151e]"><span className="mb-5 flex size-10 items-center justify-center rounded-lg border border-white/5 bg-zinc-800/60 text-violet-300"><Icon name={icon} /></span><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p><span className="mt-6 block text-xs font-medium text-violet-300">{action} <span aria-hidden="true">↗</span></span></Link>)}</div>
    </div>
  )
}
