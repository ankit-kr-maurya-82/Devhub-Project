import { useCallback, useMemo, useState } from 'react'
import { initialNotifications } from '../data/notifications.js'
import { NotificationContext } from './useNotifications.js'

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => initialNotifications.map((notification) => ({ ...notification })))
  const markAsRead = useCallback((id) => {
    setNotifications((items) => items.map((notification) => notification.id === id && !notification.read ? { ...notification, read: true } : notification))
  }, [])
  const markAllAsRead = useCallback(() => {
    setNotifications((items) => items.map((notification) => notification.read ? notification : { ...notification, read: true }))
  }, [])
  const deleteNotification = useCallback((id) => {
    setNotifications((items) => items.filter((notification) => notification.id !== id))
  }, [])
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const value = useMemo(() => ({ notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }), [notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
