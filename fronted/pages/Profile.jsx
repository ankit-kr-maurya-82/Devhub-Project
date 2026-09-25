import { useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ActivityFeed from '../components/ActivityFeed'
import Achievements from '../components/Achievements'
import ContributionOverview from '../components/ContributionOverview'
import Icon from '../components/Icon'
import CodingProfileStats from '../components/coding/CodingProfileStats'
import { developer, developerStats, formatDeveloperDate, profileAnswers, profileBlogs, profileQuestions } from '../data/developer'

const tabs = ['Overview', 'Questions', 'Answers', 'Blogs', 'Activity']
const postLists = { questions: profileQuestions, answers: profileAnswers, blogs: profileBlogs }

function PostList({ type }) {
  const posts = postLists[type]
  const total = developerStats.find(stat => stat.key === type).value
  return (
    <section aria-label={`Recent ${type}`} className="overflow-hidden rounded-xl border border-white/10 bg-[#121317]">
      <div className="border-b border-white/10 p-5 sm:p-6"><h2 className="text-lg font-semibold">Recent {type}</h2><p className="mt-1 text-xs text-zinc-400">Showing {posts.length} recent {type} of {total} total · Sample content</p></div>
      <div className="divide-y divide-white/10">
        {posts.map(post => (
          <article key={post.id} className="p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400"><time dateTime={post.date}>{formatDeveloperDate(post.date)}</time>{post.accepted && <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-300">Accepted answer</span>}{post.resolved && <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-300">Resolved</span>}{post.readingTime && <span>{post.readingTime}</span>}</div>
            <h3 className="break-words text-base font-semibold leading-7 text-zinc-100">{post.title}</h3>
            <p className="mt-2 break-words text-sm leading-7 text-zinc-400">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="rounded-md border border-violet-400/10 bg-violet-400/5 px-2.5 py-1 font-mono text-[11px] text-violet-300">{tag}</span>)}</div>
            <p className="mt-4 text-xs text-zinc-400">{type === 'blogs' ? `${post.likes} likes` : `${post.votes} votes`}{type === 'questions' && ` · ${post.answers} answers`}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabRefs = useRef([])
  const requestedTab = searchParams.get('tab') || 'overview'
  const activeTab = tabs.some(tab => tab.toLowerCase() === requestedTab) ? requestedTab : 'overview'
  const reputation = developerStats.find(stat => stat.key === 'reputation').value

  const selectTab = tab => setSearchParams(current => {
    const next = new URLSearchParams(current)
    if (tab === 'overview') next.delete('tab')
    else next.set('tab', tab)
    return next
  }, { preventScrollReset: true })

  const handleTabKey = (event, index) => {
    let nextIndex
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabs.length - 1
    else return
    event.preventDefault()
    selectTab(tabs[nextIndex].toLowerCase())
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/dashboard" className="rounded text-sm text-zinc-400 hover:text-violet-300">← Dashboard</Link><span className="rounded-full border border-violet-400/15 bg-violet-400/5 px-3 py-1.5 text-[11px] text-violet-300">Mock developer profile</span></div>
      <header className="overflow-hidden rounded-2xl border border-white/10 bg-[#121317]">
        <div aria-hidden="true" className="relative h-28 overflow-hidden border-b border-violet-400/10 bg-gradient-to-br from-violet-500/25 via-violet-500/10 to-[#121317] sm:h-36"><span className="absolute -right-1 -top-7 rotate-12 font-mono text-[140px] font-bold leading-none text-violet-300/10">&lt;/&gt;</span><span className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200/60 sm:left-8">Always learning. Always building.</span></div>
        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-10 mb-5 flex flex-wrap items-end justify-between gap-4"><div role="img" aria-label={`${developer.name}'s avatar`} className="flex size-24 items-center justify-center rounded-2xl border-4 border-[#121317] bg-gradient-to-br from-violet-400 to-indigo-700 text-3xl font-bold tracking-tight shadow-xl">{developer.initials}</div><div className="rounded-xl border border-violet-400/15 bg-violet-400/5 px-4 py-2 text-right"><p className="text-xl font-semibold tabular-nums text-violet-200">{reputation.toLocaleString('en-US')}</p><p className="text-[11px] text-zinc-400">Reputation</p></div></div>
          <h1>{developer.name}</h1><p className="mt-1 break-words font-mono text-sm text-violet-300">@{developer.username}</p><p className="mt-4 text-sm font-medium text-zinc-300">{developer.role}</p><p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">{developer.bio}</p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs text-zinc-400"><li className="flex items-center gap-2"><Icon name="home" className="size-4 text-zinc-500" />{developer.location || 'Location not added'}</li><li className="flex items-center gap-2"><Icon name="code" className="size-4 text-zinc-500" />{developer.github || 'GitHub not connected'}</li><li className="flex items-center gap-2"><Icon name="clock" className="size-4 text-zinc-500" />Joined {developer.joined}</li></ul>
        </div>
      </header>

      <div role="tablist" aria-label="Developer profile sections" className="flex gap-1 overflow-x-auto border-b border-white/10 px-1 py-1">
        {tabs.map((tab, index) => {
          const key = tab.toLowerCase()
          return <button key={key} ref={element => { tabRefs.current[index] = element }} type="button" role="tab" id={`profile-tab-${key}`} aria-controls={`profile-panel-${key}`} aria-selected={activeTab === key} tabIndex={activeTab === key ? 0 : -1} onClick={() => selectTab(key)} onKeyDown={event => handleTabKey(event, index)} className={`shrink-0 rounded-t-md border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:-outline-offset-2 ${activeTab === key ? 'border-violet-400 bg-violet-400/5 text-violet-300' : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}`}>{tab}</button>
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {tabs.map(tab => {
            const key = tab.toLowerCase()
            return <div key={key} role="tabpanel" id={`profile-panel-${key}`} aria-labelledby={`profile-tab-${key}`} hidden={activeTab !== key} tabIndex={0} className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400">
              {activeTab === key && (key === 'overview' ? (
                <div className="space-y-6">
                  <section aria-labelledby="profile-overview" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6"><h2 id="profile-overview" className="text-base font-semibold">Community contributions</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Learning in public and sharing something useful along the way.</p><dl className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">{developerStats.filter(stat => stat.key !== 'reputation').map(stat => <div key={stat.key}><dt className="text-xs leading-5 text-zinc-400">{stat.label}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</dd></div>)}</dl></section>
                  <ContributionOverview />
                  <section aria-labelledby="profile-recent" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 id="profile-recent" className="text-base font-semibold">Recent activity</h2><button type="button" onClick={() => { selectTab('activity'); tabRefs.current[4]?.focus() }} className="rounded text-xs text-violet-300 hover:text-violet-200">View all activity →</button></div><ActivityFeed limit={3} /></section>
                </div>
              ) : key === 'activity' ? (
                <section aria-labelledby="profile-all-activity" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6"><h2 id="profile-all-activity" className="text-lg font-semibold">Activity</h2><p className="mb-6 mt-1 text-xs text-zinc-400">Recent questions, answers, articles, and milestones.</p><ActivityFeed /></section>
              ) : <PostList type={key} />)}
            </div>
          })}
        </div>
        <aside className="min-w-0 space-y-6">
          <CodingProfileStats />
          <section aria-labelledby="profile-skills" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6"><h2 id="profile-skills" className="text-base font-semibold">Skills</h2><p className="mt-1 text-xs leading-5 text-zinc-400">Tools and technologies I work with.</p><ul className="mt-5 flex flex-wrap gap-2">{developer.skills.map(skill => <li key={skill} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">{skill}</li>)}</ul></section>
          <section aria-labelledby="profile-achievements" className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-6"><h2 id="profile-achievements" className="mb-5 text-base font-semibold">Achievements</h2><Achievements /></section>
        </aside>
      </div>
    </div>
  )
}

