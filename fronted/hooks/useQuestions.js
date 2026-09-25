import { useSyncExternalStore } from 'react'
import { initialQuestions } from '../data/questions'

// In-memory demo state: shared across routes, reset on a full page reload.
let questions = initialQuestions
const listeners = new Set()
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
const getSnapshot = () => questions
const publish = next => { questions = next; listeners.forEach(listener => listener()) }

export function useQuestions() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function postQuestion({ title, description, code, tags }) {
  const id = `question-${crypto.randomUUID()}`
  publish([{ id, title, description: description.slice(0, 180), body: description, code, tags, votes: 0, userVote: 0, answers: 0, responses: [], views: '0', username: 'you', reputation: 1, time: 'Just now', createdAt: Date.now(), updatedAt: Date.now() }, ...questions])
  return id
}

export function addAnswer(questionId, body) {
  if (!body.trim()) return
  publish(questions.map(question => question.id !== questionId ? question : {
    ...question, answers: question.answers + 1, updatedAt: Date.now(),
    responses: [...question.responses, { id: crypto.randomUUID(), body: body.trim(), username: 'you', reputation: 1, votes: 0, userVote: 0, time: 'Just now', accepted: false }],
  }))
}

export function vote(questionId, direction, answerId) {
  const applyVote = item => {
    const nextVote = item.userVote === direction ? 0 : direction
    return { ...item, votes: item.votes - item.userVote + nextVote, userVote: nextVote }
  }
  publish(questions.map(question => question.id !== questionId ? question : answerId
    ? { ...question, responses: question.responses.map(answer => answer.id === answerId ? applyVote(answer) : answer) }
    : applyVote(question)))
}
