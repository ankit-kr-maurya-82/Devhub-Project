import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Skeleton from '../components/Skeleton'
import api from '../src/lib/api.js'
import { useMockSession } from '../src/state/useMockSession.js'

const dateLabel = value => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable'

const quickActions = [
  { to: '/ask-question', icon: 'plus', title: 'Ask a question', description: 'Get help from the developer community.' },
  { to: '/create-blog', icon: 'book', title: 'Write a blog', description: 'Share a guide or something you learned.' },
  { to: '/community', icon: 'users', title: 'Open community', description: 'Join a room and talk with members.' },
]

function ActivityRow({ item }) {
  return (
    <li className="flex min-w-0 items-start gap-3 border-b border-[var(--border)] py-4 last:border-b-0 last:pb-0 first:pt-0 sm:gap-4">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name={item.type === 'blog' ? 'book' : 'message'} className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={item.href} className="min-w-0 break-words text-sm font-semibold text-[var(--text)] hover:text-[var(--accent)]">{item.title}</Link>
          {item.type === 'blog' && <Badge variant={item.status === 'published' ? 'success' : 'neutral'}>{item.status}</Badge>}
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">{item.type === 'blog' ? 'Blog updated' : 'Question posted'} · <time dateTime={item.date}>{dateLabel(item.date)}</time></p>
        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          {item.type === 'question' && <><span>{item.answers} {item.answers === 1 ? 'answer' : 'answers'}</span><span>{item.votes} votes</span></>}
        </p>
      </div>
    </li>
  )
}

export default function Dashboard() {
  const { user } = useMockSession()
  const userId = String(user?.id || user?._id || '')
  const [refreshKey, setRefreshKey] = useState(0)
  const [questionState, setQuestionState] = useState({ items: [], loading: true, error: '' })
  const [blogState, setBlogState] = useState({ items: [], total: null, loading: true, error: '' })

  useEffect(() => {
    let active = true
    Promise.allSettled([
      api.questions.list({ limit: '50', sort: 'newest' }),
      api.blogs.mine({ page: '1', limit: '20' }),
    ]).then(([questionResult, blogResult]) => {
      if (!active) return
      if (questionResult.status === 'fulfilled') {
        const ownQuestions = questionResult.value.data.filter(question => String(question.author?._id || question.author) === userId)
        setQuestionState({ items: ownQuestions, loading: false, error: '' })
      } else {
        setQuestionState(previous => ({ ...previous, loading: false, error: questionResult.reason?.message || 'Could not load your recent questions.' }))
      }
      if (blogResult.status === 'fulfilled') {
        setBlogState({ items: blogResult.value.data, total: blogResult.value.pagination?.total ?? null, loading: false, error: '' })
      } else {
        setBlogState(previous => ({ ...previous, loading: false, error: blogResult.reason?.message || 'Could not load your blogs.' }))
      }
    })
    return () => { active = false }
  }, [userId, refreshKey])

  const activity = useMemo(() => [
    ...questionState.items.map(question => ({
      id: `question-${question._id}`,
      type: 'question',
      title: question.title,
      date: question.createdAt,
      href: `/questions/${question._id}`,
      answers: question.answerCount || 0,
      votes: question.votes || 0,
    })),
    ...blogState.items.map(blog => ({
      id: `blog-${blog._id}`,
      type: 'blog',
      title: blog.title,
      date: blog.updatedAt || blog.createdAt,
      href: blog.status === 'published' ? `/blogs/${encodeURIComponent(blog.slug)}` : `/blogs/${encodeURIComponent(blog.slug)}/edit`,
      status: blog.status,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 6), [questionState.items, blogState.items])

  const displayName = user?.name || user?.username || 'there'
  const hasAnyError = questionState.error || blogState.error
  const loading = questionState.loading || blogState.loading
  const retry = () => {
    setQuestionState(previous => ({ ...previous, loading: true, error: '' }))
    setBlogState(previous => ({ ...previous, loading: true, error: '' }))
    setRefreshKey(key => key + 1)
  }
  const activityLimitNote = [
    !questionState.loading && !questionState.error && 'Questions are matched from the latest 50 public posts, so older questions may not appear.',
    blogState.total > blogState.items.length && `Only the 20 most recently updated of ${blogState.total} blogs are shown.`,
  ].filter(Boolean).join(' ')

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Your workspace"
        title={`Welcome back, ${displayName}`}
        description="Pick up where you left off and keep sharing with the community."
        action={<Link to="/ask-question" className="ui-button"><Icon name="plus" className="size-4" />Ask a question</Link>}
      />

      <section aria-label="Account overview" className="ui-card flex flex-wrap items-center gap-4 p-4 sm:gap-5 sm:p-6">
        <Avatar name={displayName} src={user?.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-semibold text-[var(--text)]">{displayName}</p>
          {user?.username && <p className="mt-0.5 break-all text-sm text-[var(--muted)]">@{user.username}</p>}
          {user?.bio && <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-[var(--muted)]">{user.bio}</p>}
        </div>
        <Link to="/profile" className="ui-button-secondary w-full sm:w-auto"><Icon name="user" className="size-4" />View profile</Link>
      </section>

      <section aria-label="Quick actions" className="grid gap-3 md:grid-cols-3">
        {quickActions.map(action => (
          <Link key={action.to} to={action.to} className="ui-card ui-card-interactive group flex min-w-0 items-start gap-3 p-4 sm:p-5">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name={action.icon} className="size-4" /></span>
            <span className="min-w-0"><span className="block text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">{action.title} <span aria-hidden="true">→</span></span><span className="mt-1 block text-sm leading-5 text-[var(--muted)]">{action.description}</span></span>
          </Link>
        ))}
      </section>

      <section aria-labelledby="dashboard-activity" className="ui-card min-w-0 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h2 id="dashboard-activity" className="text-lg font-semibold text-[var(--text)]">Recent activity</h2><p className="mt-1 text-sm text-[var(--muted)]">Your latest questions and blog updates.</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/questions" className="ui-button-secondary">Browse questions</Link><Link to="/blogs" className="ui-button-secondary">Explore blogs</Link></div>
        </div>
        {hasAnyError && <ErrorState title="Some activity could not be loaded" description={[questionState.error, blogState.error].filter(Boolean).join(' ')} onRetry={retry} className="mb-4" />}
        {loading && activity.length === 0 && <div role="status" aria-live="polite" aria-busy="true" className="space-y-4 py-2"><span className="sr-only">Loading your activity…</span>{[0, 1, 2].map(item => <div key={item} aria-hidden="true" className="flex gap-3"><Skeleton className="size-9 shrink-0 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>)}</div>}
        {!loading && activity.length > 0 && <ol>{activity.map(item => <ActivityRow key={item.id} item={item} />)}</ol>}
        {!loading && !activity.length && !hasAnyError && <EmptyState title="No activity yet" description="Your questions and blog updates will appear here." action={<div className="flex flex-wrap justify-center gap-2"><Link to="/ask-question" className="ui-button">Ask your first question</Link><Link to="/create-blog" className="ui-button-secondary">Write a blog</Link></div>} />}
        {!loading && activityLimitNote && <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{activityLimitNote}</p>}
      </section>

      {(typeof user?.reputation === 'number' || blogState.total !== null) && <section aria-labelledby="dashboard-overview" className="space-y-3">
        <h2 id="dashboard-overview" className="text-lg font-semibold text-[var(--text)]">Your overview</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {typeof user?.reputation === 'number' && <div className="ui-card p-4 sm:p-5"><dt className="text-sm font-medium text-[var(--muted)]">Reputation</dt><dd className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text)]">{user.reputation.toLocaleString()}</dd></div>}
          {blogState.total !== null && <div className="ui-card p-4 sm:p-5"><dt className="text-sm font-medium text-[var(--muted)]">Blogs</dt><dd className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text)]">{blogState.total.toLocaleString()}</dd><p className="mt-1 text-xs text-[var(--muted)]">Drafts and published posts</p></div>}
        </dl>
      </section>}
    </div>
  )
}
