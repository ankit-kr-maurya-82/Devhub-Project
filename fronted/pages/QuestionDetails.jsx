import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addAnswer, useQuestions, vote } from '../hooks/useQuestions'
import QuestionContent from '../components/QuestionContent'
import VoteControls from '../components/VoteControls'

function Author({ username, reputation, time }) {
  return <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500"><span className="flex size-8 items-center justify-center rounded-full bg-violet-500/15 font-semibold text-violet-300" aria-hidden="true">{username[0].toUpperCase()}</span><span className="text-zinc-200">{username}</span><span>{reputation.toLocaleString()} reputation</span><span>· {time}</span></div>
}

function Detail({ question }) {
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
    addAnswer(question.id, answer)
    setAnswer('')
    setNotice('Your answer was added to this demo discussion.')
  }
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link to="/questions" className="inline-block text-sm text-violet-300 hover:text-violet-200">← All questions</Link>
      <header><h1 className="break-words text-2xl leading-tight sm:text-3xl">{question.title}</h1><p className="mt-4 text-xs text-zinc-500">Asked {question.time.toLowerCase()} · {question.views} views · {question.answers} answers</p></header>
      <article className="flex gap-4 rounded-xl border border-white/10 bg-[#121317] p-4 sm:gap-6 sm:p-7">
        <VoteControls label="question" votes={question.votes} userVote={question.userVote} onVote={direction => vote(question.id, direction)} />
        <div className="min-w-0 flex-1"><QuestionContent body={question.body} code={question.code} /><div className="mt-5 flex flex-wrap gap-2">{question.tags.map(tag => <Link key={tag} to={`/questions?tag=${encodeURIComponent(tag)}`} className="max-w-full break-all rounded-md bg-violet-500/10 px-3 py-1 font-mono text-xs text-violet-300 hover:bg-violet-500/20">{tag}</Link>)}</div><Author {...question} /></div>
      </article>
      <section aria-labelledby="answers-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="answers-heading" className="text-xl font-semibold">{question.answers} {question.answers === 1 ? 'Answer' : 'Answers'}</h2><span className="text-xs text-zinc-500">Accepted answer first</span></div>
        {[...question.responses].sort((a, b) => Number(Boolean(b.accepted)) - Number(Boolean(a.accepted))).map(response => <article key={response.id} className={`flex gap-4 rounded-xl border bg-[#121317] p-4 sm:gap-6 sm:p-7 ${response.accepted ? 'border-emerald-400/30' : 'border-white/10'}`}><VoteControls label={`answer by ${response.username}`} votes={response.votes} userVote={response.userVote} onVote={direction => vote(question.id, direction, response.id)} /><div className="min-w-0 flex-1">{response.accepted && <p className="mb-4 text-xs font-medium text-emerald-400">✓ Accepted answer</p>}<QuestionContent body={response.body} code={response.code} /><Author {...response} /></div></article>)}
        {!question.responses.length && <p className="rounded-xl border border-dashed border-zinc-700 p-6 text-sm text-zinc-400">No answers yet. Be the first to share an approach.</p>}
      </section>
      <form onSubmit={submit} noValidate className="rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-7"><label htmlFor="answer" className="text-lg font-semibold">Add Answer</label><p id="answer-help" className="mb-4 mt-2 text-xs text-zinc-500">Explain your reasoning and share what worked. Plain text, 20–10,000 characters.</p><textarea id="answer" name="answer" value={answer} onChange={event => { setAnswer(event.target.value); setNotice(''); setError('') }} required minLength={20} maxLength={10000} rows={7} aria-invalid={Boolean(error)} aria-describedby={`answer-help answer-status${error ? ' answer-error' : ''}`} placeholder="Share your solution…" className="w-full rounded-lg border border-white/10 bg-[#0c0d10] p-4 text-sm leading-6 focus:border-violet-400 focus:outline-none" /><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-zinc-500">Local demo only · changes reset on reload.</p><button type="submit" className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Post Answer</button></div>{error && <p id="answer-error" role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}<p id="answer-status" role="status" className="mt-3 text-sm text-violet-300">{notice}</p></form>
    </div>
  )
}

export default function QuestionDetails() {
  const { id } = useParams()
  const question = useQuestions().find(item => item.id === id)
  if (!question) return <section className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#121317] p-8"><h1>Question not found</h1><p className="mt-4 text-zinc-400">This question does not exist in the current demo. Locally created questions reset on reload.</p><Link to="/questions" className="mt-6 inline-block text-violet-300">Browse questions →</Link></section>
  return <Detail key={question.id} question={question} />
}
