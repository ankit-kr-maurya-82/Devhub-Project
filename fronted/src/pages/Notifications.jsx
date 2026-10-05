import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import NotificationItem from '../components/notifications/NotificationItem.jsx'
import { useNotifications } from '../state/useNotifications.js'

export default function Notifications() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState('all')
  const [feedback, setFeedback] = useState('')
  const visibleNotifications = filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications

  return (
    <div className="mx-auto w-full max-w-4xl text-[var(--text)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Your replies, mentions, and community updates.</p>
        </div>
        <button type="button" disabled={unreadCount === 0} onClick={() => { markAllAsRead(); setFeedback('All notifications marked as read.') }} className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-default disabled:text-[var(--subtle)] disabled:hover:bg-[var(--surface)]"><Icon name="check" className="size-4" />Mark all as read</button>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-3 sm:px-5">
          <div role="group" aria-label="Filter notifications" className="flex gap-1 rounded-xl bg-[var(--page)] p-1">
            {[{ value: 'all', label: 'All', count: notifications.length }, { value: 'unread', label: 'Unread', count: unreadCount }].map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${filter === item.value ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>{item.label}<span className={`rounded px-1.5 py-0.5 text-xs ${filter === item.value ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--subtle)]'}`}>{item.count}</span></button>)}
          </div>
          <p className="text-sm text-[var(--subtle)]">{unreadCount === 0 ? 'All caught up' : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`}</p>
        </div>
        <p role="status" className={feedback ? 'border-b border-[var(--border)] px-5 py-3 text-sm text-[var(--success)]' : 'sr-only'}>{feedback}</p>
        {visibleNotifications.length > 0 ? <ul aria-label={filter === 'unread' ? 'Unread notifications' : 'All notifications'}>{visibleNotifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onAction={setFeedback} />)}</ul> : (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name={filter === 'unread' ? 'check' : 'bell'} className="size-6" /></span>
            <h2 className="text-lg font-semibold">{filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{filter === 'unread' ? 'You have read all your notifications. New activity will appear here.' : 'When developers respond, mention you, or share news, you’ll find it here.'}</p>
            {filter === 'unread' && notifications.length > 0 && <button type="button" onClick={() => setFilter('all')} className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]">View all notifications</button>}
          </div>
        )}
      </div>
      <p className="mt-4 text-sm leading-5 text-[var(--muted)]">Sample activity. Changes reset when you refresh.</p>
    </div>
  )
}
