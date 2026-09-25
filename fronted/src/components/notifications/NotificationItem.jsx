import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'
import { formatNotificationTime } from '../../data/notifications.js'
import { useNotifications } from '../../state/useNotifications.js'

export default function NotificationItem({ notification, compact = false, onNavigate, onClose, onAction }) {
  const { markAsRead, deleteNotification } = useNotifications()
  const markRead = () => {
    markAsRead(notification.id)
    onAction?.('Notification marked as read.')
  }

  return (
    <li className={`border-b border-[var(--border)] last:border-b-0 ${notification.read ? '' : 'bg-[var(--accent-soft)]'}`}>
      <div className={`flex items-start gap-3 ${compact ? 'p-4' : 'p-4 sm:gap-4 sm:p-5'}`}>
        <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-xl border border-[var(--border)] ${compact ? 'size-9' : 'size-11'} ${notification.type === 'achievement' ? 'bg-[var(--surface-raised)] text-[var(--warning)]' : 'bg-[var(--surface-raised)] text-[var(--accent)]'}`}><Icon name={notification.icon} className={compact ? 'size-4' : 'size-5'} /></span>
        <div className="min-w-0 flex-1">
          <Link to={notification.target} onClick={() => {
            if (!notification.read) markAsRead(notification.id)
            onNavigate?.(notification)
            onClose?.()
          }} className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
            <div className="flex items-start gap-2">
              <p className={`flex-1 text-sm leading-5 ${notification.read ? 'font-medium text-[var(--muted)]' : 'font-semibold text-[var(--text)]'}`}>{notification.title}</p>
              {!notification.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--accent)]"><span className="sr-only">Unread</span></span>}
            </div>
            <p className={`mt-1 break-words leading-5 text-[var(--muted)] ${compact ? 'text-xs' : 'text-sm'}`}>{notification.message}</p>
          </Link>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <time dateTime={notification.timestamp} title={new Date(notification.timestamp).toLocaleString()} className="text-[11px] text-[var(--subtle)]">{formatNotificationTime(notification.timestamp)}</time>
            {!notification.read ? (
              <button type="button" onClick={markRead} aria-label={`Mark as read: ${notification.title}`} className="flex min-h-7 items-center gap-1 rounded text-[11px] font-medium text-[var(--accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"><Icon name="check" className="size-3.5" />Mark as read</button>
            ) : <span className="flex items-center gap-1 text-[11px] text-[var(--subtle)]"><Icon name="check" className="size-3" />Read</span>}
            <button type="button" onClick={() => { deleteNotification(notification.id); onAction?.('Notification deleted.') }} aria-label={`Delete notification: ${notification.title}`} className="ml-auto flex min-h-7 items-center gap-1 rounded text-[11px] text-[var(--subtle)] transition hover:text-[var(--danger)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"><Icon name="trash" className="size-3.5" /><span className={compact ? 'sr-only' : ''}>Delete</span></button>
          </div>
        </div>
      </div>
    </li>
  )
}
