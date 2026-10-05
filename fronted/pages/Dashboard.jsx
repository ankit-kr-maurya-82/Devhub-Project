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
      <header className="ui-page-header">
        <div><h1>My dashboard</h1><p className="mt-2 text-sm text-[var(--muted)]">Welcome back, {developer.name.split(' ')[0]}. Here’s your activity at a glance.</p></div>
        <Link to="/profile" className="ui-button-secondary"><Icon name="user" className="size-4" />View profile</Link>
      </header>
      <p className="text-xs text-[var(--subtle)]">Sample profile and activity</p>
      <DeveloperStats />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-labelledby="dashboard-activity" className="ui-card p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 id="dashboard-activity" className="text-lg font-semibold">Recent activity</h2><Link to="/profile?tab=activity" className="rounded text-sm font-medium text-[var(--accent)] hover:underline">View all →</Link></div>
          <ActivityFeed limit={4} />
        </section>
        <aside className="space-y-6">
          <section aria-labelledby="dashboard-actions" className="ui-card p-5"><h2 id="dashboard-actions" className="mb-4 text-base font-semibold">What’s next?</h2><div className="space-y-2">{[{ to: '/ask-question', icon: 'message', label: 'Ask a question' }, { to: '/create-blog', icon: 'book', label: 'Write a blog' }, { to: '/coding', icon: 'code', label: 'Practice coding' }].map(item => <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-lg p-3 text-sm text-[var(--accent)] hover:bg-[var(--accent-soft)]"><Icon name={item.icon} className="size-4" />{item.label}<span aria-hidden="true" className="ml-auto">→</span></Link>)}</div></section>
          <section aria-labelledby="dashboard-tags" className="ui-card p-5"><h2 id="dashboard-tags" className="mb-5 text-base font-semibold">Your top topics</h2><TopTags /></section>
        </aside>
      </div>
      <CodingDashboardSection />
      <details className="ui-card p-5 sm:p-6"><summary className="rounded text-base font-semibold">More progress and achievements</summary><div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><ContributionOverview /><section aria-label="Achievements"><h2 className="mb-4 text-base font-semibold">Achievements</h2><Achievements /></section></div></details>
    </div>
  )
}
