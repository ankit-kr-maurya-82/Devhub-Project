import { useState } from 'react'
import { createAdminData } from '../data/admin.js'
import { AdminContext } from './useAdmin.js'

const contentCollections = { question: 'questions', blog: 'blogs', message: 'communityMessages' }
const isOpenReport = report => report.status === 'pending' || report.status === 'reviewing'

export default function AdminProvider({ children }) {
  const [data, setData] = useState(createAdminData)
  const [weekStart] = useState(() => Date.now() - 7 * 86400000)
  const remainingUsers = data.users.filter(user => user.status !== 'deleted')
  const remainingQuestions = data.questions.filter(question => question.status !== 'deleted')
  const stats = {
    totalUsers: remainingUsers.length,
    activeUsers: remainingUsers.filter(user => user.status === 'active').length,
    totalQuestions: remainingQuestions.length,
    totalAnswers: remainingQuestions.reduce((sum, question) => sum + question.answers, 0),
    totalBlogs: data.blogs.filter(blog => blog.status !== 'deleted').length,
    communityMessages: data.communityMessages.filter(message => message.status !== 'deleted').length,
    reportedContent: data.reports.filter(isOpenReport).length,
    newUsersThisWeek: remainingUsers.filter(user => new Date(user.joinedAt).getTime() >= weekStart).length,
  }

  function updateUserStatus(id, status) {
    if (!['active', 'suspended', 'deleted'].includes(status)) return
    setData(previous => ({ ...previous, users: previous.users.map(user => user.id === id ? { ...user, status } : user) }))
  }

  function updateContentStatus(type, id, status) {
    const collection = contentCollections[type]
    if (!collection || !['published', 'hidden', 'deleted'].includes(status)) return
    setData(previous => ({
      ...previous,
      [collection]: previous[collection].map(record => record.id === id ? { ...record, status } : record),
      reports: status === 'deleted'
        ? previous.reports.map(report => report.targetType === type && report.targetId === id && isOpenReport(report) ? { ...report, status: 'removed' } : report)
        : previous.reports,
    }))
  }

  function updateReportStatus(id, status) {
    if (!['reviewing', 'dismissed'].includes(status)) return
    setData(previous => ({ ...previous, reports: previous.reports.map(report => report.id === id && isOpenReport(report) ? { ...report, status } : report) }))
  }

  function removeReportedContent(id) {
    setData(previous => {
      const report = previous.reports.find(item => item.id === id)
      const collection = contentCollections[report?.targetType]
      if (!report || !collection || !isOpenReport(report)) return previous
      return {
        ...previous,
        [collection]: previous[collection].map(record => record.id === report.targetId ? { ...record, status: 'deleted' } : record),
        reports: previous.reports.map(item => item.targetType === report.targetType && item.targetId === report.targetId && isOpenReport(item) ? { ...item, status: 'removed' } : item),
      }
    })
  }

  return <AdminContext.Provider value={{ ...data, stats, updateUserStatus, updateContentStatus, updateReportStatus, removeReportedContent }}>{children}</AdminContext.Provider>
}
