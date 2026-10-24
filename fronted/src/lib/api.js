import { resolveSocketOrigin } from './socketConfig.js'

const configuredApiBase = import.meta.env.VITE_API_URL?.trim()
if (import.meta.env.PROD && !configuredApiBase) {
  throw new Error('VITE_API_URL must be set to the production API root ending in /api/v1.')
}
if (import.meta.env.PROD) {
  let parsedApiBase
  try { parsedApiBase = new URL(configuredApiBase) } catch {
    throw new Error('Production VITE_API_URL must be an absolute HTTP(S) URL ending in /api/v1.')
  }
  if (!['http:', 'https:'].includes(parsedApiBase.protocol) || parsedApiBase.pathname.replace(/\/$/, '') !== '/api/v1' || parsedApiBase.search || parsedApiBase.hash || parsedApiBase.username || parsedApiBase.password) {
    throw new Error('Production VITE_API_URL must be an absolute HTTP(S) URL ending in /api/v1.')
  }
}
const apiBase = (configuredApiBase || '/api/v1').replace(/\/$/, '')
export const socketOrigin = resolveSocketOrigin(apiBase)

async function request(path, { method = 'GET', body, ...options } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? options.headers : { 'Content-Type': 'application/json', ...options.headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...options,
  })
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`)
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

export const api = {
  request,
  auth: {
    me: () => request('/auth/me'),
    login: credentials => request('/auth/login', { method: 'POST', body: credentials }),
    register: details => request('/auth/register', { method: 'POST', body: details }),
    logout: () => request('/auth/logout'),
    forgotPassword: email => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token, details) => request(`/auth/reset-password/${encodeURIComponent(token)}`, { method: 'POST', body: details }),
  },
  users: {
    profile: id => request(`/user/profile/${encodeURIComponent(id)}`),
    updateProfile: details => request('/user/profile', { method: 'PUT', body: details }),
  },
  questions: {
    list: params => request(`/questions${params ? `?${new URLSearchParams(params)}` : ''}`),
    get: id => request(`/questions/${encodeURIComponent(id)}`),
    create: details => request('/questions', { method: 'POST', body: details }),
    update: (id, details) => request(`/questions/${encodeURIComponent(id)}`, { method: 'PATCH', body: details }),
    remove: id => request(`/questions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    vote: (id, voteType) => request(`/questions/${encodeURIComponent(id)}/vote`, { method: 'POST', body: { voteType } }),
    answers: id => request(`/questions/${encodeURIComponent(id)}/answers`),
    createAnswer: (id, content) => request(`/questions/${encodeURIComponent(id)}/answers`, { method: 'POST', body: { content } }),
    acceptAnswer: (questionId, answerId) => request(`/questions/${encodeURIComponent(questionId)}/answers/${encodeURIComponent(answerId)}/accept`, { method: 'PATCH' }),
    voteAnswer: (id, voteType) => request(`/answers/${encodeURIComponent(id)}/vote`, { method: 'POST', body: { voteType } }),
  },
  blogs: {
    list: params => request(`/blogs${params ? `?${new URLSearchParams(params)}` : ''}`),
    mine: params => request(`/blogs/mine${params ? `?${new URLSearchParams(params)}` : ''}`),
    mineGet: slug => request(`/blogs/mine/${encodeURIComponent(slug)}`),
    get: slug => request(`/blogs/${encodeURIComponent(slug)}`),
    create: details => request('/blogs', { method: 'POST', body: details }),
    update: (slug, details) => request(`/blogs/${encodeURIComponent(slug)}`, { method: 'PATCH', body: details }),
    remove: slug => request(`/blogs/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  },
  coding: {
    problems: params => request(`/coding/problems${params ? `?${new URLSearchParams(params)}` : ''}`),
    problem: slug => request(`/coding/problems/${encodeURIComponent(slug)}`),
    adminProblems: params => request(`/coding/problems/manage${params ? `?${new URLSearchParams(params)}` : ''}`),
    adminProblem: slug => request(`/coding/problems/manage/${encodeURIComponent(slug)}`),
    createProblem: details => request('/coding/problems', { method: 'POST', body: details }),
    updateProblem: (slug, details) => request(`/coding/problems/${encodeURIComponent(slug)}`, { method: 'PATCH', body: details }),
    removeProblem: slug => request(`/coding/problems/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
    submit: (slug, details) => request(`/coding/problems/${encodeURIComponent(slug)}/submissions`, { method: 'POST', body: details }),
    submissions: params => request(`/submissions${params ? `?${new URLSearchParams(params)}` : ''}`),
  },
  reports: {
    create: details => request('/reports', { method: 'POST', body: details }),
  },
  admin: {
    dashboard: () => request('/admin/dashboard'),
    users: params => request(`/admin/users${params ? `?${new URLSearchParams(params)}` : ''}`),
    setUserActive: (id, isActive) => request(`/admin/users/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { isActive } }),
    reports: params => request(`/admin/reports${params ? `?${new URLSearchParams(params)}` : ''}`),
    moderateReport: (id, details) => request(`/admin/reports/${encodeURIComponent(id)}`, { method: 'PATCH', body: details }),
  },
  comments: {
    questionList: id => request(`/questions/${encodeURIComponent(id)}/comments`),
    addQuestion: (id, content) => request(`/questions/${encodeURIComponent(id)}/comments`, { method: 'POST', body: { content } }),
    answerList: id => request(`/answers/${encodeURIComponent(id)}/comments`),
    addAnswer: (id, content) => request(`/answers/${encodeURIComponent(id)}/comments`, { method: 'POST', body: { content } }),
    edit: (id, content) => request(`/comments/${encodeURIComponent(id)}`, { method: 'PATCH', body: { content } }),
    remove: id => request(`/comments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
  rooms: {
    list: params => request(`/rooms${params ? `?${new URLSearchParams(params)}` : ''}`),
    get: id => request(`/rooms/${encodeURIComponent(id)}`),
    create: details => request('/rooms', { method: 'POST', body: details }),
    join: id => request(`/rooms/${encodeURIComponent(id)}/join`, { method: 'POST' }),
    leave: id => request(`/rooms/${encodeURIComponent(id)}/leave`, { method: 'POST' }),
    messages: id => request(`/rooms/${encodeURIComponent(id)}/messages`),
    sendMessage: (id, details) => request(`/rooms/${encodeURIComponent(id)}/messages`, { method: 'POST', body: details }),
  },
  messages: {
    edit: (id, content) => request(`/messages/${encodeURIComponent(id)}`, { method: 'PATCH', body: { content } }),
    remove: id => request(`/messages/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    react: (id, emoji) => request(`/messages/${encodeURIComponent(id)}/reaction`, { method: 'POST', body: { emoji } }),
  },
  notifications: {
    list: params => request(`/notifications${params ? `?${new URLSearchParams(params)}` : ''}`),
    unreadCount: () => request('/notifications/unread-count'),
    markRead: id => request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    remove: id => request(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
}

export default api
