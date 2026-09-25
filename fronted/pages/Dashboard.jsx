import { Link } from 'react-router-dom'
import DeveloperStats from '../components/DeveloperStats'
import ActivityFeed from '../components/ActivityFeed'
import Achievements from '../components/Achievements'
import TopTags from '../components/TopTags'
import ContributionOverview from '../components/ContributionOverview'
import Icon from '../components/Icon'
import CodingDashboardSection from '../components/coding/CodingDashboardSection'
import { developer } from '../data/developer'

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-violet-400">Your developer dashboard</p><h1>Welcome back, {developer.name.split(' ')[0]}<span className="text-violet-400">.</span></h1><p className="mt-3 text-sm leading-6 text-zinc-400">A little progress, every day. Here’s what you’ve been building.</p></div>
        <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-violet-400/40 hover:text-white"><Icon name="user" className="size-4" />View profile <span aria-hidden="true">↗</span></Link>
      </header>
      <p className="flex w-fit items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/5 px-3 py-1.5 text-[11px] text-violet-300"><span aria-hidden="true" className="size-1.5 rounded-full bg-violet-400" />Mock developer profile · September 2026</p>
      <DeveloperStats />
      <CodingDashboardSection />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <ContributionOverview />
          <section aria-labelledby="dashboard-activity" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 id="dashboard-activity" className="text-base font-semibold">Recent activity</h2><p className="mt-1 text-xs text-zinc-400">Your latest contributions to the community.</p></div><Link to="/profile?tab=activity" className="rounded text-xs font-medium text-violet-300 hover:text-violet-200">View all activity <span aria-hidden="true">→</span></Link></div>
            <ActivityFeed limit={4} />
          </section>
        </div>
        <aside className="min-w-0 space-y-6">
          <section aria-labelledby="dashboard-tags" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6"><h2 id="dashboard-tags" className="text-base font-semibold">Top tags</h2><p className="mb-6 mt-1 text-xs leading-5 text-zinc-400">Your most-used tags, by contribution.</p><TopTags /></section>
          <section aria-labelledby="dashboard-achievements" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><h2 id="dashboard-achievements" className="text-base font-semibold">Achievements</h2><span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-medium text-amber-200">4 earned</span></div><Achievements /></section>
        </aside>
      </div>
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-violet-400/15 bg-gradient-to-r from-violet-500/10 to-[#121317] p-5 sm:p-6"><div><h2 className="text-base font-semibold">Keep the momentum going.</h2><p className="mt-1 text-sm leading-6 text-zinc-400">Your next question could help someone else find their answer.</p></div><div className="flex flex-wrap gap-3"><Link to="/ask-question" className="rounded-lg bg-violet-500 px-4 py-3 text-sm font-semibold hover:bg-violet-400">Ask a question</Link><Link to="/create-blog" className="rounded-lg border border-white/15 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5">Write a blog</Link></div></section>
    </div>
  )
}
