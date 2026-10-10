import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import api from '../src/lib/api.js'
import { useMockSession } from '../src/state/useMockSession.js'

const formatDate = value => value ? new Date(value).toLocaleDateString() : ''

export default function Dashboard() {
  const { user } = useMockSession()
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.questions.list({ limit: '50', sort: 'newest' })
      .then(result => {
        if (!active) return
        const userId = String(user?.id || user?._id || '')
        const ownQuestions = result.data.filter(question => String(question.author?._id || question.author) === userId)
        setQuestions(ownQuestions)
        setTotal(ownQuestions.length)
      })
      .catch(requestError => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="ui-page-header">
        <div><h1>My dashboard</h1><p className="mt-2 text-sm text-[var(--muted)]">Your account and questions on DevHub.</p></div>
        <Link to="/profile" className="ui-button-secondary"><Icon name="user" className="size-4" />View profile</Link>
      </header>
      <section className="ui-card p-5 sm:p-6">
        <p className="text-sm text-[var(--muted)]">Signed in as</p>
        <p className="mt-1 text-lg font-semibold">{user?.name || user?.username}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{user?.email}</p>
        <div className="mt-5 border-t border-[var(--border)] pt-5"><p className="text-xs text-[var(--muted)]">Reputation</p><p className="mt-1 text-2xl font-semibold tabular-nums">{user?.reputation ?? 0}</p></div>
      </section>
      <section aria-labelledby="dashboard-questions" className="ui-card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 id="dashboard-questions" className="text-lg font-semibold">Your questions</h2><p className="mt-1 text-sm text-[var(--muted)]">{total} {total === 1 ? 'question' : 'questions'} loaded from your account.</p></div><Link to="/ask-question" className="ui-button"><Icon name="plus" className="size-4" />Ask a question</Link></div>
        {loading && <p role="status" className="text-sm text-[var(--muted)]">Loading your questions…</p>}
        {error && <p role="alert" className="text-sm text-[var(--danger)]">Could not load your questions: {error}</p>}
        {!loading && !error && questions.length === 0 && <p className="text-sm text-[var(--muted)]">You haven’t posted any questions yet.</p>}
        <div className="divide-y divide-[var(--border)]">{questions.map(question => <article key={question._id} className="py-4 first:pt-0 last:pb-0"><Link to={`/questions/${question._id}`} className="font-semibold text-[var(--accent)] hover:underline">{question.title}</Link><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]"><span>{question.answerCount || 0} answers</span><span>{question.votes || 0} votes</span><time dateTime={question.createdAt}>{formatDate(question.createdAt)}</time></div></article>)}</div>
      </section>
    </div>
  )
}
