import { useCallback, useId, useRef, useState } from 'react'
import Icon from '../../../components/Icon.jsx'
import { useNotifications } from '../../state/useNotifications.js'
import NotificationDropdown from './NotificationDropdown.jsx'

export default function NotificationBell() {
  const { unreadCount } = useNotifications()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const dropdownId = useId()
  const closeNotifications = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={() => setOpen((visible) => !visible)} aria-label={`Notifications, ${unreadCount} unread`} aria-expanded={open} aria-controls={open ? dropdownId : undefined} aria-haspopup="dialog" className={`relative flex size-9 items-center justify-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:size-10 ${open ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}>
        <Icon name="bell" className="size-4.5" />
        {unreadCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-w-4.5 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--primary)] px-1 text-xs font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {open && <NotificationDropdown id={dropdownId} triggerRef={triggerRef} onClose={closeNotifications} />}
    </div>
  )
}
