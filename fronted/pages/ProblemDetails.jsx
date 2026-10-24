import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CodeEditorMock from '../components/coding/CodeEditorMock.jsx'
import DifficultyBadge from '../components/coding/DifficultyBadge.jsx'
import TestCasePanel from '../components/coding/TestCasePanel.jsx'
import api from '../src/lib/api.js'
import { useMockSession } from '../src/state/useMockSession.js'

export default function ProblemDetails() {
  const { slug } = useParams()
  const { user } = useMockSession()
  const [problem, setProblem] = useState(null)
  const [language, setLanguage] = useState('')
  const [sourceCode, setSourceCode] = useState('')
  const [loadedSlug, setLoadedSlug] = useState('')
  const [loadError, setLoadError] = useState(null)
  const loading = loadedSlug !== slug && loadError?.slug !== slug
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let active = true
    api.coding.problem(slug)
      .then(({ data }) => { if (active) { setProblem(data); setLanguage(data.supportedLanguages[0] || 'javascript'); setLoadedSlug(slug); setLoadError(null) } })
      .catch(reason => { if (active) { setProblem(null); setLoadError({ slug, message: reason.message || 'Could not load this problem.' }) } })
    return () => { active = false }
  }, [slug])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setFeedback(null)
    if (!sourceCode.trim()) return setError('Enter a solution before submitting.')
    setSubmitting(true)
    try {
      const result = await api.coding.submit(slug, { language, sourceCode })
      setFeedback(result.data)
    } catch (reason) { setError(reason.message || 'Could not store this submission.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <p role="status" aria-live="polite" aria-busy="true" className="mx-auto max-w-5xl py-12 text-center text-sm text-[var(--muted)]">Loading problem…</p>
  if (!problem) return <main className="ui-card mx-auto max-w-5xl p-5 sm:p-6"><h1>Problem unavailable</h1><p role="alert" className="mt-3 text-sm text-[var(--danger)]">{loadError?.message || 'This problem could not be found.'}</p><Link to="/coding" className="ui-button-secondary mt-4">Back to problems</Link></main>

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
      <Link to="/coding" className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]">← Coding problems</Link>
      <header className="space-y-3 border-b border-[var(--border)] pb-5"><div className="flex flex-wrap items-center gap-3"><h1 className="min-w-0 break-words">{problem.title}</h1><DifficultyBadge difficulty={problem.difficulty} /></div><div className="flex flex-wrap gap-2">{problem.topics.map(topic => <Link key={topic} to={`/coding?topic=${encodeURIComponent(topic)}`} className="max-w-full break-words rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]">{topic}</Link>)}</div></header>
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-6">
        <section aria-label="Problem description and sample cases" className="min-w-0 space-y-4"><article className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"><h2 className="mb-3 text-lg font-semibold">Description</h2><p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text)]">{problem.description}</p>{problem.constraints?.length > 0 && <><h3 className="mb-2 mt-5 font-semibold">Constraints</h3><ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">{problem.constraints.map((constraint, index) => <li key={index} className="break-words">{constraint}</li>)}</ul></>}</article><TestCasePanel cases={problem.sampleTestCases} /></section>
        <section aria-label="Solution editor" className="min-w-0 space-y-4"><form onSubmit={submit} className="min-w-0 space-y-4"><div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4"><label className="min-w-40 flex-1 text-sm font-medium">Language<select value={language} onChange={event => setLanguage(event.target.value)} className="ui-input mt-1">{problem.supportedLanguages.map(value => <option key={value} value={value}>{value}</option>)}</select></label><Link to="/submissions" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">Submission history</Link></div><CodeEditorMock language={language} value={sourceCode} onChange={setSourceCode} /><p className="text-xs leading-5 text-[var(--muted)]">Submission size limit: 20,000 characters. Code execution is currently unavailable.</p>{!user && <p className="text-sm text-[var(--muted)]"><Link to="/login" className="font-medium text-[var(--accent)] underline">Sign in</Link> to store a submission.</p>}{error && <p role="alert" className="rounded-lg border border-[var(--danger)] p-3 text-sm text-[var(--danger)]">{error}</p>}<button disabled={!user || submitting} aria-busy={submitting} className="ui-button disabled:opacity-50">{submitting ? 'Storing…' : 'Submit solution'}</button></form>
          {feedback && <section role="status" aria-live="polite" className="rounded-xl border border-[var(--info)] bg-[var(--info-soft)] p-4"><h2 className="font-semibold">Submission stored · Not executed</h2><p className="mt-2 break-words text-sm leading-6 text-[var(--muted)]">{feedback.executionMetadata?.message || 'A secure judge service is not configured. No verdict was produced.'}</p><Link to="/submissions" className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-[var(--accent)]">View submission history</Link></section>}
        </section>
      </div>
    </main>
  )
}
