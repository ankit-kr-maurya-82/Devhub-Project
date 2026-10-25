import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import NotificationItem from '../components/notifications/NotificationItem.jsx'
import { useNotifications } from '../state/useNotifications.js'

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    error,
    realtimeStatus,
    refresh,
    loadMore,
    markAllAsRead,
  } = useNotifications()
  const [filter, setFilter] = useState('all')
  const [feedback, setFeedback] = useState('')
  const visibleNotifications = filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications

  return (
    <div className="mx-auto w-full max-w-4xl text-[var(--text)]">
      <header className="ui-page-header">
        <div>
          <h1>Notifications</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Your replies, mentions, and community updates.</p>
          <p role="status" aria-live="polite" className="mt-1 text-xs text-[var(--subtle)]">Real-time updates: {realtimeStatus}</p>
        </div>
        <button type="button" disabled={unreadCount === 0} onClick={() => { void markAllAsRead().then(success => { if (success) setFeedback('All notifications marked as read.') }) }} className="ui-button-secondary text-[var(--accent)] disabled:opacity-50"><Icon name="check" className="size-4" />Mark all as read</button>
      </header>

      <section aria-label="Notification activity" className="mt-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] sm:mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-3 sm:px-5">
          <div role="group" aria-label="Filter notifications" className="flex gap-1 rounded-xl bg-[var(--page)] p-1">
            {[{ value: 'all', label: 'All', count: totalCount }, { value: 'unread', label: 'Unread', count: unreadCount }].map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${filter === item.value ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>{item.label}<span className={`rounded px-1.5 py-0.5 text-xs ${filter === item.value ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--subtle)]'}`}>{item.count}</span></button>)}
          </div>
          <p className="text-sm text-[var(--subtle)]">{unreadCount === 0 ? 'All caught up' : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`}</p>
        </div>
        <p role="status" className={feedback ? 'border-b border-[var(--border)] px-5 py-3 text-sm text-[var(--success)]' : 'sr-only'}>{feedback}</p>
        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3 text-sm text-[var(--danger)]"><span>{error}</span><button type="button" onClick={() => { void refresh() }} className="font-semibold text-[var(--accent)] underline">Try again</button></div>}
        {loading ? <p role="status" aria-live="polite" aria-busy="true" className="px-5 py-10 text-center text-sm text-[var(--muted)]">Loading notifications…</p> : visibleNotifications.length > 0 ? <ul aria-label={filter === 'unread' ? 'Unread notifications' : 'All notifications'}>{visibleNotifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onAction={setFeedback} />)}</ul> : (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]"><Icon name={filter === 'unread' ? 'check' : 'bell'} className="size-6" /></span>
            <h2 className="text-lg font-semibold">{filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{filter === 'unread' ? 'You have read all loaded notifications. Older unread activity may be on another page.' : 'When developers respond, mention you, or share news, you’ll find it here.'}</p>
            {filter === 'unread' && notifications.length > 0 && <button type="button" onClick={() => setFilter('all')} className="ui-button-secondary mt-4 text-[var(--accent)]">View all notifications</button>}
          </div>
        )}
        {!loading && hasMore && <div className="border-t border-[var(--border)] p-4 text-center"><button type="button" disabled={loadingMore} onClick={() => { void loadMore() }} className="ui-button-secondary text-[var(--accent)] disabled:opacity-60">{loadingMore ? 'Loading…' : 'Load more notifications'}</button></div>}
      </section>
    </div>
  )
}

