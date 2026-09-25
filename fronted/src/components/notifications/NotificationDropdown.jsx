import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'
import { useNotifications } from '../../state/useNotifications.js'
import NotificationItem from './NotificationItem.jsx'

export default function NotificationDropdown({ id, onClose, triggerRef }) {
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [feedback, setFeedback] = useState('')
  const panelRef = useRef(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const firstControl = panelRef.current?.querySelector('button:not([disabled]), a[href]')
      ;(firstControl || panelRef.current)?.focus()
    })
    const dismissOnOutsideClick = (event) => {
      if (panelRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return
      onClose()
    }
    const dismissOnEscape = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
    document.addEventListener('pointerdown', dismissOnOutsideClick)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerdown', dismissOnOutsideClick)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [onClose, triggerRef])

  return (
    <section ref={panelRef} id={id} role="dialog" aria-label="Notifications" tabIndex={-1} className="fixed inset-x-3 top-20 z-50 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl outline-none sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-96">
      <div className="shrink-0 border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">Notifications <span className="ml-1 rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] text-[var(--accent)]">{unreadCount} new</span></h2>
          <button type="button" onClick={onClose} aria-label="Close notifications" className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-raised)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"><Icon name="close" className="size-4" /></button>
        </div>
        <button type="button" onClick={() => { markAllAsRead(); setFeedback('All notifications marked as read.') }} disabled={unreadCount === 0} className="mt-2 rounded text-xs font-medium text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-default disabled:text-[var(--subtle)] disabled:no-underline">Mark all as read</button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {notifications.length > 0 ? <ul aria-label="Recent notifications">{notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} compact onClose={onClose} onAction={setFeedback} />)}</ul> : (
          <div className="px-5 py-12 text-center"><Icon name="bell" className="mx-auto mb-3 size-7 text-[var(--subtle)]" /><p className="text-sm font-medium text-[var(--text)]">You're all caught up</p><p className="mt-1 text-xs text-[var(--muted)]">New community activity will appear here.</p></div>
        )}
      </div>
      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <p role="status" className={feedback ? 'mb-2 px-1 text-xs text-[var(--success)]' : 'sr-only'}>{feedback}</p>
        <Link to="/notifications" onClick={onClose} className="block rounded-lg bg-[var(--surface-raised)] px-3 py-2.5 text-center text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]">View all notifications <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  )
}
