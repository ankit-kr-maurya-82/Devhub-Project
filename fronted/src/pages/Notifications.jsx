import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import NotificationItem from '../components/notifications/NotificationItem.jsx'
import { useNotifications } from '../state/useNotifications.js'
import PageHeader from '../../components/PageHeader.jsx'
import Badge from '../../components/Badge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorState from '../../components/ErrorState.jsx'
import Skeleton from '../../components/Skeleton.jsx'

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
      <PageHeader eyebrow="Your activity" title="Notifications" description="Replies, mentions, and community updates in one place." action={<div className="flex flex-wrap items-center gap-3"><p role="status" aria-live="polite" className="text-xs text-[var(--subtle)]">Live updates <Badge variant={realtimeStatus === 'Connected' ? 'success' : realtimeStatus === 'Unavailable' ? 'warning' : 'neutral'}>{realtimeStatus}</Badge></p><button type="button" disabled={unreadCount === 0} onClick={() => { void markAllAsRead().then(success => { if (success) setFeedback('All notifications marked as read.') }) }} className="ui-button-secondary text-[var(--accent)] disabled:opacity-50"><Icon name="check" className="size-4" />Mark all as read</button></div>} />

      <section aria-label="Notification activity" className="mt-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] sm:mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-3 sm:px-5">
          <div role="group" aria-label="Filter notifications" className="flex gap-1 rounded-xl bg-[var(--page)] p-1">
            {[{ value: 'all', label: 'All', count: totalCount }, { value: 'unread', label: 'Unread', count: unreadCount }].map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${filter === item.value ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>{item.label}<span className={`rounded px-1.5 py-0.5 text-xs ${filter === item.value ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--subtle)]'}`}>{item.count}</span></button>)}
          </div>
          <p className="text-sm text-[var(--subtle)]">{unreadCount === 0 ? 'All caught up' : <><Badge variant="accent">{unreadCount} unread</Badge><span className="sr-only"> notifications</span></>}</p>
        </div>
        <p role="status" className={feedback ? 'border-b border-[var(--border)] px-5 py-3 text-sm text-[var(--success)]' : 'sr-only'}>{feedback}</p>
        {error && <ErrorState className="rounded-none border-x-0 border-t-0" title="Notification update failed" description={error} onRetry={() => { void refresh() }} retryLabel="Try again" />}
        {loading ? <div role="status" aria-live="polite" aria-busy="true" className="space-y-4 p-5"><span className="sr-only">Loading notifications…</span>{Array.from({ length: 4 }, (_, index) => <div key={index} aria-hidden="true" className="flex items-start gap-3 border-b border-[var(--border)] pb-4"><Skeleton className="size-11 shrink-0 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-1/4" /></div></div>)}</div> : visibleNotifications.length > 0 ? <ul aria-label={filter === 'unread' ? 'Unread notifications' : 'All notifications'}>{visibleNotifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onAction={setFeedback} />)}</ul> : (
          <EmptyState className="min-h-64 rounded-none border-0" title={filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'} description={filter === 'unread' ? 'You have read all loaded notifications. Older unread activity may be on another page.' : 'When developers respond, mention you, or share news, you’ll find it here.'} action={filter === 'unread' && notifications.length > 0 ? <button type="button" onClick={() => setFilter('all')} className="ui-button-secondary">View all notifications</button> : null} />
        )}
        {!loading && hasMore && <div className="border-t border-[var(--border)] p-4 text-center"><button type="button" disabled={loadingMore} onClick={() => { void loadMore() }} className="ui-button-secondary text-[var(--accent)] disabled:opacity-60">{loadingMore ? 'Loading…' : 'Load more notifications'}</button></div>}
      </section>
    </div>
  )
}

