import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'
import AdminStatCard from '../../components/admin/AdminStatCard.jsx'
import { AdminPageHeader, StatusBadge } from '../../components/admin/AdminUI.jsx'
import { formatDate } from '../../components/admin/adminUtils.js'
import { useAdmin } from '../../state/useAdmin.js'

const metrics = [
  {
    key: 'totalUsers',
    label: 'Total users',
    icon: 'users',
    description: 'Community accounts'
  },
  {
    key: 'totalQuestions',
    label: 'Questions',
    icon: 'message',
    description: 'Questions from members'
  },
  {
    key: 'totalBlogs',
    label: 'Blogs',
    icon: 'book',
    description: 'Articles from members'
  },
  {
    key: 'reportedContent',
    label: 'Open reports',
    icon: 'shield',
    description: 'Reports to review',
    tone: 'warning'
  },
]

export default function AdminDashboard() {
  const { users, questions, blogs, reports, stats } = useAdmin()
  const recent = [
    {
      title: 'Recent users',
      to: '/admin/users',
      icon: 'users',
      items: users.map(user => ({
        id: user.id,
        title: user.name,
        description: `@${user.username}`,
        date: user.joinedAt,
        status: user.status
      }))
    },
    {
      title: 'Recent questions',
      to: '/admin/questions',
      icon: 'message',
      items: questions.map(item => (
        {
          ...item,
          description: item.author
        }
      ))
    },
    {
      title: 'Recent blogs',
      to: '/admin/blogs',
      icon: 'book',
      items: blogs.map(item => (
        {
          ...item,
          description: item.author
        }
      ))
    },
    {
      title: 'Recent reports',
      to: '/admin/reports',
      icon: 'shield',
      items: reports.map(item => (
        {
          ...item,
          title: item.targetTitle,
          description: item.reason
        }
      ))
    },
  ]
  return <div
    className="min-w-0"
  >
    <AdminPageHeader
      title="Community overview" description="See recent activity and review what needs your attention." /
    >
    <div
      className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {metrics.map((
        { key, ...metric }) => <AdminStatCard key={key} {...metric} value={stats[key]} />)}
    </div>

    <div
      className="mt-7 grid min-w-0 gap-5 xl:grid-cols-2">
      {recent.map(section => <section key={section.to}
        className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Icon name={section.icon} className="size-4 text-[var(--accent)]" />
            {section.title}
          </h2>
          <Link to={section.to}
            className="shrink-0 text-sm font-medium text-[var(--accent)] hover:underline" aria-label={`View all ${section.title.toLowerCase()}`}
          >
            View all
          </Link>
        </div>
        <ul
          className="divide-y divide-[var(--border)]">
          {[...section.items]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map(item =>
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 px-5 py-4">
                <div
                  className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text)]">
                    {item.title}
                  </p>
                  <p
                    className="mt-1.5 truncate text-xs text-[var(--subtle)]">
                    {item.description} · {formatDate(item.date)}
                  </p>
                </div>
                <span className="shrink-0">
                  <StatusBadge status={item.status} />
                </span>
              </li>)}
        </ul>
        {section.items.length === 0 &&
          <p className="px-5 py-8 text-sm text-[var(--muted)]">
            No recent activity.
          </p>
        }
      </section>
      )}
    </div>
  </div>
}
