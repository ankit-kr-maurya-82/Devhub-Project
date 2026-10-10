import { useCallback, useEffect, useMemo, useState } from 'react'
import { NotificationContext } from './useNotifications.js'
import { useMockSession } from './useMockSession.js'
import api from '../lib/api.js'

const toNotification = item => {
  const typeLabels = { answer: 'New answer', comment: 'New comment', question_upvote: 'Question upvoted', answer_upvote: 'Answer upvoted', accepted_answer: 'Answer accepted', mention: 'You were mentioned', system: 'DevHub update' }
  const questionId = item.relatedQuestion?._id || item.relatedQuestion
  return {
    id: String(item._id),
    type: item.type,
    icon: item.type === 'accepted_answer' ? 'check' : item.type === 'answer' || item.type === 'comment' ? 'message' : 'bell',
    title: typeLabels[item.type] || 'DevHub notification',
    message: item.message,
    timestamp: item.createdAt,
    read: Boolean(item.isRead),
    target: questionId ? `/questions/${questionId}` : '/notifications',
  }
}

export default function NotificationProvider({ children }) {
  const { user } = useMockSession()
  const [notifications, setNotifications] = useState([])
  const [notificationOwner, setNotificationOwner] = useState('')
  useEffect(() => {
    let active = true
    if (!user) return undefined
    api.notifications.list()
      .then(result => { if (active) { setNotifications(result.data.map(toNotification)); setNotificationOwner(String(user.id || user._id)) } })
      .catch(() => { if (active) { setNotifications([]); setNotificationOwner(String(user.id || user._id)) } })
    return () => { active = false }
  }, [user])
  const markAsRead = useCallback((id) => {
    api.notifications.markRead(id).catch(() => {})
    setNotifications((items) => items.map((notification) => notification.id === id && !notification.read ? { ...notification, read: true } : notification))
  }, [])
  const markAllAsRead = useCallback(() => {
    api.notifications.markAllRead().catch(() => {})
    setNotifications((items) => items.map((notification) => notification.read ? notification : { ...notification, read: true }))
  }, [])
  const deleteNotification = useCallback((id) => {
    api.notifications.remove(id).catch(() => {})
    setNotifications((items) => items.filter((notification) => notification.id !== id))
  }, [])
  const currentUserId = String(user?.id || user?._id || '')
  const visibleNotifications = useMemo(() => notificationOwner === currentUserId ? notifications : [], [notificationOwner, currentUserId, notifications])
  const unreadCount = visibleNotifications.filter((notification) => !notification.read).length
  const value = useMemo(() => ({ notifications: visibleNotifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }), [visibleNotifications, unreadCount, markAsRead, markAllAsRead, deleteNotification])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
