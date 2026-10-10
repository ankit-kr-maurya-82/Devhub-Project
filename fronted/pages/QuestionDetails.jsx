import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addAnswer, loadQuestionDetails, useQuestions, vote } from '../hooks/useQuestions'
import QuestionContent from '../components/QuestionContent'
import VoteControls from '../components/VoteControls'
import { useMockSession } from '../src/state/useMockSession.js'
import CommentThread from '../components/CommentThread.jsx'

function Author({ username, reputation, time }) {
  return <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]"><span className="flex size-8 items-center justify-center rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--accent)]" aria-hidden="true">{username[0].toUpperCase()}</span><span className="text-[var(--text)]">{username}</span><span>{reputation.toLocaleString()} reputation</span><span>· {time}</span></div>
}

function Detail({ question }) {
  const { user } = useMockSession()
  const [answer, setAnswer] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (answer.trim().length < 20 || answer.length > 10000) {
      setError('Write 20–10,000 characters to explain your answer.')
      event.currentTarget.elements.namedItem('answer')?.focus()
      return
    }
    setError('')
    addAnswer(question.id, answer).then(() => {
      setAnswer('')
      setNotice('Your answer has been added.')
    }).catch(requestError => setError(requestError.message))
  }
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link to="/questions" className="inline-block text-sm text-[var(--accent)] hover:underline">← All questions</Link>
      <header><h1 className="break-words text-2xl leading-tight sm:text-3xl">{question.title}</h1><p className="mt-4 text-xs text-[var(--muted)]">Asked {question.time.toLowerCase()} · {question.views} views · {question.answers} answers</p></header>
      <article className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:gap-6 sm:p-7">
        <VoteControls label="question" votes={question.votes} userVote={question.userVote} disabled={!user} onVote={direction => vote(question.id, direction).catch(requestError => setError(requestError.message))} />
        <div className="min-w-0 flex-1"><QuestionContent body={question.body} code={question.code} /><div className="mt-5 flex flex-wrap gap-2">{question.tags.map(tag => <Link key={tag} to={`/questions?tag=${encodeURIComponent(tag)}`} className="max-w-full break-all rounded-md bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-soft)]">{tag}</Link>)}</div><Author {...question} /></div>
      </article>
      <CommentThread targetType="Question" targetId={question.id} />
      <section aria-labelledby="answers-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="answers-heading" className="text-xl font-semibold">{question.answers} {question.answers === 1 ? 'Answer' : 'Answers'}</h2>{question.responses.some(response => response.accepted) && <span className="text-xs text-[var(--muted)]">Accepted answer first</span>}</div>
        {[...question.responses].sort((a, b) => Number(Boolean(b.accepted)) - Number(Boolean(a.accepted))).map(response => <article key={response.id} className={`flex gap-4 rounded-xl border bg-[var(--surface)] p-4 sm:gap-6 sm:p-7 ${response.accepted ? 'border-[var(--success)]' : 'border-[var(--border)]'}`}><VoteControls label={`answer by ${response.username}`} votes={response.votes} userVote={response.userVote} disabled={!user} onVote={direction => vote(question.id, direction, response.id).catch(requestError => setError(requestError.message))} /><div className="min-w-0 flex-1">{response.accepted && <p className="mb-4 text-xs font-medium text-[var(--success)]">✓ Accepted answer</p>}<QuestionContent body={response.body} code={response.code} /><Author {...response} /><CommentThread targetType="Answer" targetId={response.id} /></div></article>)}
        {!question.responses.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">No answers yet. Share a solution below.</p>}
      </section>
      {user ? <form onSubmit={submit} noValidate className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7"><label htmlFor="answer" className="text-lg font-semibold">Your answer</label><p id="answer-help" className="mb-4 mt-2 text-xs text-[var(--muted)]">Explain your solution in 20–10,000 characters.</p><textarea id="answer" name="answer" value={answer} onChange={event => { setAnswer(event.target.value); setNotice(''); setError('') }} required minLength={20} maxLength={10000} rows={7} aria-invalid={Boolean(error)} aria-describedby={`answer-help answer-status${error ? ' answer-error' : ''}`} placeholder="Share your solution…" className="w-full rounded-lg border border-[var(--border)] bg-[var(--page)] p-4 text-sm leading-6 focus:border-[var(--accent)] focus:outline-none" /><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[var(--muted)]">Your answer will be saved to DevHub.</p><button type="submit" className="ui-button">Post answer</button></div>{error && <p id="answer-error" role="alert" className="mt-3 text-sm text-[var(--danger)]">{error}</p>}<p id="answer-status" role="status" className="mt-3 text-sm text-[var(--accent)]">{notice}</p></form> : <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]"><Link to="/login" className="font-semibold text-[var(--accent)]">Log in</Link> to write an answer.</p>}
    </div>
  )
}

export default function QuestionDetails() {
  const { id } = useParams()
  const question = useQuestions().find(item => item.id === id)
  const [loadedQuestion, setLoadedQuestion] = useState(null)
  const [requestState, setRequestState] = useState({ id: null, loading: true, error: '' })
  useEffect(() => {
    let active = true
    loadQuestionDetails(id)
      .then(result => { if (active) { setLoadedQuestion(result); setRequestState({ id, loading: false, error: '' }) } })
      .catch(error => { if (active) setRequestState({ id, loading: false, error: error.message }) })
    return () => { active = false }
  }, [id])
  const data = (loadedQuestion?.id === id && loadedQuestion) || (question?.id === id && question)
  const loading = requestState.id !== id || requestState.loading
  const loadError = requestState.id === id ? requestState.error : ''
  if (loading && !data) return <p role="status" className="mx-auto max-w-3xl p-8 text-sm text-[var(--muted)]">Loading question…</p>
  if (!data) return <section className="mx-auto max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8"><h1>Question unavailable</h1><p role="alert" className="mt-4 text-[var(--muted)]">{loadError || 'This question could not be loaded from the API.'}</p><Link to="/questions" className="mt-6 inline-block text-[var(--accent)]">Browse questions →</Link></section>
  return <Detail key={data.id} question={data} />
}
