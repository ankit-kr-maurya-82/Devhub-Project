import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createSocketClient } from '../lib/socketConfig.js'
import { socketOrigin } from '../lib/api.js'
import { NotificationContext } from './useNotifications.js'
import { useMockSession } from './useMockSession.js'
import api from '../lib/api.js'

const PAGE_SIZE = 20

const toNotification = item => {
  const typeLabels = { answer: 'New answer', comment: 'New comment', question_upvote: 'Question upvoted', answer_upvote: 'Answer upvoted', accepted_answer: 'Answer accepted', community_message: 'New community message', mention: 'You were mentioned', system: 'DevHub update' }
  const questionId = item.relatedQuestion?._id || item.relatedQuestion
  return {
    id: String(item._id),
    type: item.type,
    icon: item.type === 'accepted_answer' ? 'check' : item.type === 'answer' || item.type === 'comment' || item.type === 'community_message' ? 'message' : 'bell',
    title: typeLabels[item.type] || 'DevHub notification',
    message: item.message,
    timestamp: item.createdAt,
    read: Boolean(item.isRead),
    target: questionId ? `/questions/${questionId}` : item.type === 'community_message' ? '/community' : '/notifications',
  }
}

const initialData = {
  ownerId: '',
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  page: 1,
  hasMore: false,
  loading: true,
  loadingMore: false,
  error: '',
}

export default function NotificationProvider({ children }) {
  const { user } = useMockSession()
  const currentUserId = String(user?.id || user?._id || '')
  const [data, setData] = useState(initialData)
  const [realtimeStatus, setRealtimeStatus] = useState('Connecting…')
  const notificationIds = useRef(new Set())
  const pendingLiveNotifications = useRef(new Map())
  const loadedOwnerId = useRef('')

  const mergePendingNotifications = result => {
    const notifications = result.data.map(toNotification)
    const loadedIds = new Set(notifications.map(item => item.id))
    const pending = [...pendingLiveNotifications.current.values()]
      .map(toNotification)
      .filter(item => !loadedIds.has(item.id))
    pendingLiveNotifications.current.clear()
    const mergedNotifications = [...pending, ...notifications]
      .sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp))
    const unreadAdded = pending.filter(item => !item.read).length
    return {
      notifications: mergedNotifications,
      unreadCount: result.unreadCount + unreadAdded,
      totalCount: result.pagination.total + pending.length,
      page: result.pagination.page,
      hasMore: result.pagination.page * result.pagination.limit < result.pagination.total + pending.length,
    }
  }

  useEffect(() => {
    let active = true
    notificationIds.current.clear()
    pendingLiveNotifications.current.clear()
    loadedOwnerId.current = ''

    if (!currentUserId) {
      Promise.resolve().then(() => {
        if (active) {
          setData({ ...initialData, ownerId: '', loading: false })
          setRealtimeStatus('Disconnected')
        }
      })
      return () => { active = false }
    }

    api.notifications.list({ page: '1', limit: String(PAGE_SIZE) })
      .then(result => {
        if (!active) return
        const merged = mergePendingNotifications(result)
        const notifications = merged.notifications
        notificationIds.current = new Set(notifications.map(item => item.id))
        loadedOwnerId.current = currentUserId
        setData({
          ownerId: currentUserId,
          notifications,
          unreadCount: merged.unreadCount,
          totalCount: merged.totalCount,
          page: merged.page,
          hasMore: merged.hasMore,
          loading: false,
          loadingMore: false,
          error: '',
        })
      })
      .catch(requestError => {
        if (active) {
          setData({
            ...initialData,
            ownerId: currentUserId,
            loading: false,
            error: requestError.message || 'Unable to load notifications.',
          })
        }
      })

    return () => { active = false }
  }, [currentUserId])

  const refresh = useCallback(async ({ showLoading = true } = {}) => {
    if (!currentUserId) return false
    if (showLoading) {
      setData(previous => previous.ownerId === currentUserId ? { ...previous, loading: true, error: '' } : previous)
    }
    try {
      const result = await api.notifications.list({ page: '1', limit: String(PAGE_SIZE) })
      const merged = mergePendingNotifications(result)
      const notifications = merged.notifications
      notificationIds.current = new Set(notifications.map(item => item.id))
      setData({
        ownerId: currentUserId,
        notifications,
        unreadCount: merged.unreadCount,
        totalCount: merged.totalCount,
        page: merged.page,
        hasMore: merged.hasMore,
        loading: false,
        loadingMore: false,
        error: '',
      })
      return true
    } catch (requestError) {
      setData(previous => previous.ownerId === currentUserId
        ? { ...previous, loading: false, error: requestError.message || 'Unable to load notifications.' }
        : previous)
      return false
    }
  }, [currentUserId])

  useEffect(() => {
    if (!currentUserId) return undefined
    const socket = createSocketClient(socketOrigin)
    socket.on('connect', () => {
      setRealtimeStatus('Connected')
      if (loadedOwnerId.current === currentUserId) void refresh({ showLoading: false })
    })
    socket.on('disconnect', () => setRealtimeStatus('Disconnected'))
    socket.on('connect_error', () => setRealtimeStatus('Unavailable'))
    socket.on('notificationCreated', item => {
      const notification = toNotification(item)
      if (notificationIds.current.has(notification.id)) return
      notificationIds.current.add(notification.id)
      pendingLiveNotifications.current.set(notification.id, item)
      if (pendingLiveNotifications.current.size > 100) {
        const oldestId = pendingLiveNotifications.current.keys().next().value
        pendingLiveNotifications.current.delete(oldestId)
      }
      setData(previous => {
        if (previous.ownerId !== currentUserId) return previous
        return {
          ...previous,
          notifications: [notification, ...previous.notifications],
          unreadCount: previous.unreadCount + 1,
          totalCount: previous.totalCount + 1,
        }
      })
    })
    return () => socket.disconnect()
  }, [currentUserId, refresh])

  const loadMore = useCallback(async () => {
    if (!currentUserId || data.ownerId !== currentUserId || !data.hasMore || data.loadingMore) return false
    const nextPage = data.page + 1
    setData(previous => previous.ownerId === currentUserId
      ? { ...previous, loadingMore: true, error: '' }
      : previous)
    try {
      const result = await api.notifications.list({ page: String(nextPage), limit: String(PAGE_SIZE) })
      const notifications = result.data.map(toNotification)
      for (const notification of notifications) notificationIds.current.add(notification.id)
      setData(previous => previous.ownerId === currentUserId ? {
        ...previous,
        notifications: [...previous.notifications, ...notifications.filter(item => !previous.notifications.some(existing => existing.id === item.id))],
        unreadCount: result.unreadCount,
        totalCount: result.pagination.total,
        page: result.pagination.page,
        hasMore: result.pagination.page < result.pagination.totalPages,
        loadingMore: false,
        error: '',
      } : previous)
      return true
    } catch (requestError) {
      setData(previous => previous.ownerId === currentUserId
        ? { ...previous, loadingMore: false, error: requestError.message || 'Unable to load more notifications.' }
        : previous)
      return false
    }
  }, [currentUserId, data])

  const markAsRead = useCallback(async id => {
    try {
      await api.notifications.markRead(id)
      setData(previous => {
        if (previous.ownerId !== currentUserId) return previous
        const wasUnread = previous.notifications.some(item => item.id === id && !item.read)
        return {
          ...previous,
          notifications: previous.notifications.map(item => item.id === id ? { ...item, read: true } : item),
          unreadCount: Math.max(0, previous.unreadCount - Number(wasUnread)),
          error: '',
        }
      })
      return true
    } catch (requestError) {
      setData(previous => previous.ownerId === currentUserId
        ? { ...previous, error: requestError.message || 'Unable to mark notification as read.' }
        : previous)
      return false
    }
  }, [currentUserId])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead()
      setData(previous => previous.ownerId === currentUserId ? {
        ...previous,
        notifications: previous.notifications.map(item => ({ ...item, read: true })),
        unreadCount: 0,
        error: '',
      } : previous)
      return true
    } catch (requestError) {
      setData(previous => previous.ownerId === currentUserId
        ? { ...previous, error: requestError.message || 'Unable to mark notifications as read.' }
        : previous)
      return false
    }
  }, [currentUserId])

  const deleteNotification = useCallback(async id => {
    try {
      await api.notifications.remove(id)
      setData(previous => {
        if (previous.ownerId !== currentUserId) return previous
        const notification = previous.notifications.find(item => item.id === id)
        return {
          ...previous,
          notifications: previous.notifications.filter(item => item.id !== id),
          unreadCount: Math.max(0, previous.unreadCount - Number(Boolean(notification && !notification.read))),
          totalCount: Math.max(0, previous.totalCount - 1),
          error: '',
        }
      })
      notificationIds.current.delete(id)
      return true
    } catch (requestError) {
      setData(previous => previous.ownerId === currentUserId
        ? { ...previous, error: requestError.message || 'Unable to delete notification.' }
        : previous)
      return false
    }
  }, [currentUserId])

  const visibleData = data.ownerId === currentUserId ? data : initialData
  const value = useMemo(() => ({
    notifications: visibleData.notifications,
    unreadCount: visibleData.unreadCount,
    totalCount: visibleData.totalCount,
    loading: visibleData.loading,
    loadingMore: visibleData.loadingMore,
    hasMore: visibleData.hasMore,
    error: visibleData.error,
    realtimeStatus: currentUserId ? realtimeStatus : 'Disconnected',
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }), [visibleData, currentUserId, realtimeStatus, refresh, loadMore, markAsRead, markAllAsRead, deleteNotification])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
