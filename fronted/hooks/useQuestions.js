import { useEffect, useSyncExternalStore } from 'react'
import api from '../src/lib/api.js'

let questions = []
let status = { loading: false, error: '' }
const listeners = new Set()
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
const publish = () => listeners.forEach(listener => listener())
const getSnapshot = () => questions

const relativeTime = dateValue => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return new Date(dateValue).toLocaleDateString()
}

export function mapQuestion(record) {
  const description = record.description || ''
  const codeBlock = description.match(/\n\n```([a-z0-9_+-]*)\n([\s\S]*?)\n```$/i)
  const createdAt = new Date(record.createdAt || Date.now()).getTime()
  const updatedAt = new Date(record.updatedAt || record.createdAt || Date.now()).getTime()
  return {
    id: String(record._id || record.id),
    title: record.title,
    description,
    body: codeBlock ? description.slice(0, codeBlock.index) : description,
    code: record.code || codeBlock?.[2] || '',
    tags: record.tags || [],
    votes: record.votes || 0,
    userVote: record.userVote || 0,
    answers: record.answerCount ?? record.answers ?? 0,
    responses: record.responses || [],
    views: String(record.views || 0),
    username: record.author?.username || record.author?.name || record.username || 'DevHub member',
    reputation: record.author?.reputation || record.reputation || 0,
    time: relativeTime(record.createdAt || createdAt),
    createdAt,
    updatedAt,
  }
}

export async function refreshQuestions(params = {}) {
  status = { loading: true, error: '' }
  publish()
  try {
    const result = await api.questions.list({ limit: '50', ...params })
    questions = result.data.map(mapQuestion)
    status = { loading: false, error: '' }
    publish()
    return questions
  } catch (error) {
    status = { loading: false, error: error.message }
    publish()
    throw error
  }
}

export function useQuestions() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  useEffect(() => {
    if (!questions.length && !status.loading) refreshQuestions().catch(() => {})
  }, [])
  return current
}

export function useQuestionStatus() {
  return useSyncExternalStore(subscribe, () => status, () => status)
}

export async function postQuestion({ title, description, tags }) {
  const result = await api.questions.create({ title, description, tags })
  const created = mapQuestion(result.data)
  questions = [created, ...questions.filter(question => question.id !== created.id)]
  publish()
  return created.id
}

export async function loadQuestionDetails(id) {
  const [questionResult, answerResult] = await Promise.all([
    api.questions.get(id),
    api.questions.answers(id),
  ])
  const question = mapQuestion(questionResult.data)
  question.responses = answerResult.data.map(answer => ({
    id: String(answer._id),
    body: answer.content,
    code: '',
    username: answer.author?.username || answer.author?.name || 'DevHub member',
    reputation: answer.author?.reputation || 0,
    votes: answer.votes || 0,
    userVote: 0,
    time: relativeTime(answer.createdAt),
    accepted: Boolean(answer.isAccepted),
  }))
  question.answers = question.responses.length || question.answers
  questions = [question, ...questions.filter(item => item.id !== question.id)]
  publish()
  return question
}

export async function addAnswer(questionId, body) {
  const result = await api.questions.createAnswer(questionId, body.trim())
  const answer = result.data
  const response = {
    id: String(answer._id), body: answer.content, code: '',
    username: answer.author?.username || answer.author?.name || 'You',
    reputation: answer.author?.reputation || 0, votes: answer.votes || 0,
    userVote: 0, time: relativeTime(answer.createdAt), accepted: Boolean(answer.isAccepted),
  }
  questions = questions.map(question => question.id !== questionId ? question : {
    ...question,
    answers: question.answers + 1,
    responses: [...question.responses, response],
    updatedAt: Date.now(),
  })
  publish()
  return response
}

export async function vote(questionId, direction, answerId) {
  const voteType = direction > 0 ? 'upvote' : 'downvote'
  const result = answerId
    ? await api.questions.voteAnswer(answerId, voteType)
    : await api.questions.vote(questionId, voteType)
  questions = questions.map(question => question.id !== questionId ? question : answerId
    ? { ...question, responses: question.responses.map(answer => answer.id === answerId ? { ...answer, votes: result.votes, userVote: direction } : answer) }
    : { ...question, votes: result.votes, userVote: result.message === 'Vote removed' ? 0 : direction })
  publish()
}
