const apiBase = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

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
    list: () => request('/notifications'),
    markRead: id => request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    remove: id => request(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
}

export default api
