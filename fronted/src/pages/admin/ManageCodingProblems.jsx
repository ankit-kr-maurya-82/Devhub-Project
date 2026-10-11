import { useEffect, useState } from 'react'
import api from '../../lib/api.js'

const blank = () => ({ title: '', slug: '', description: '', difficulty: 'easy', topics: '', constraints: '', sampleCases: '[]', supportedLanguages: ['javascript'], status: 'draft' })
const languages = ['javascript', 'python', 'java', 'cpp']

export default function ManageCodingProblems() {
  const [form, setForm] = useState(blank)
  const [editingSlug, setEditingSlug] = useState('')
  const [problems, setProblems] = useState([])
  const [refresh, setRefresh] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let active = true
    api.coding.adminProblems({ page: '1', limit: '50' })
      .then(payload => { if (active) { setProblems(payload.data); setLoaded(true); setError('') } })
      .catch(reason => { if (active) setError(reason.message || 'Could not load coding problems.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refresh])

  function edit(problem) {
    setEditingSlug(problem.slug)
    setForm({ title: problem.title, slug: problem.slug, description: problem.description, difficulty: problem.difficulty, topics: problem.topics.join(', '), constraints: problem.constraints.join('\n'), sampleCases: JSON.stringify(problem.sampleTestCases, null, 2), supportedLanguages: problem.supportedLanguages, status: problem.status })
    setError(''); setFeedback('')
  }
  function reset() { setEditingSlug(''); setForm(blank()); setError(''); setFeedback('') }
  function change(field, value) { setForm(current => ({ ...current, [field]: value })) }
  function toggleLanguage(language) { setForm(current => ({ ...current, supportedLanguages: current.supportedLanguages.includes(language) ? current.supportedLanguages.filter(item => item !== language) : [...current.supportedLanguages, language] })) }

  async function save(event) {
    event.preventDefault(); setError(''); setFeedback('')
    let sampleTestCases
    try { sampleTestCases = JSON.parse(form.sampleCases) }
    catch { setError('Sample cases must be valid JSON.'); return }
    if (!Array.isArray(sampleTestCases)) { setError('Sample cases must be a JSON array.'); return }
    if (!form.supportedLanguages.length) { setError('Choose at least one supported language.'); return }
    const payload = { title: form.title, slug: form.slug, description: form.description, difficulty: form.difficulty, topics: form.topics.split(',').map(item => item.trim()).filter(Boolean), constraints: form.constraints.split('\n').map(item => item.trim()).filter(Boolean), sampleTestCases, supportedLanguages: form.supportedLanguages, status: form.status }
    setSaving(true)
    try {
      if (editingSlug) await api.coding.updateProblem(editingSlug, payload)
      else await api.coding.createProblem(payload)
      setFeedback(editingSlug ? 'Problem updated.' : 'Problem created.')
      reset(); setRefresh(value => value + 1)
    } catch (reason) { setError(reason.message || 'Could not save the problem.') }
    finally { setSaving(false) }
  }

  async function remove(problem) {
    if (!window.confirm(`Permanently delete “${problem.title}”? Existing submissions will remain in history.`)) return
    setError(''); setSaving(true)
    try { await api.coding.removeProblem(problem.slug); setFeedback('Problem deleted.'); if (editingSlug === problem.slug) reset(); setRefresh(value => value + 1) }
    catch (reason) { setError(reason.message || 'Could not delete problem.') }
    finally { setSaving(false) }
  }

  return <div className="space-y-6"><header><h1 className="text-2xl font-bold">Coding problems</h1><p className="mt-2 text-sm text-[var(--muted)]">Create and manage published challenges and sample cases. No code execution is enabled.</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-300 p-3 text-sm text-red-700">{error}</p>}{feedback && <p role="status" className="rounded-xl border border-[var(--border)] p-3 text-sm text-[var(--success)]">{feedback}</p>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <form onSubmit={save} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="text-lg font-semibold">{editingSlug ? 'Edit problem' : 'Create problem'}</h2>
        <label className="block text-sm font-medium">Title<input required minLength="5" maxLength="180" value={form.title} onChange={event => change('title', event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <label className="block text-sm font-medium">Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength="120" value={form.slug} onChange={event => change('slug', event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2 font-mono" /></label>
        <label className="block text-sm font-medium">Description<textarea required minLength="20" maxLength="20000" rows="7" value={form.description} onChange={event => change('description', event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Difficulty<select value={form.difficulty} onChange={event => change('difficulty', event.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label className="text-sm font-medium">Publication<select value={form.status} onChange={event => change('status', event.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2"><option value="draft">Unpublished</option><option value="published">Published</option></select></label></div>
        <label className="block text-sm font-medium">Topics, comma separated<input value={form.topics} onChange={event => change('topics', event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <label className="block text-sm font-medium">Constraints, one per line<textarea rows="3" value={form.constraints} onChange={event => change('constraints', event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2" /></label>
        <fieldset><legend className="mb-2 text-sm font-medium">Supported languages</legend><div className="flex flex-wrap gap-4">{languages.map(language => <label key={language} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.supportedLanguages.includes(language)} onChange={() => toggleLanguage(language)} />{language}</label>)}</div></fieldset>
        <label className="block text-sm font-medium">Sample test cases (JSON)<textarea value={form.sampleCases} onChange={event => change('sampleCases', event.target.value)} rows="8" spellCheck="false" className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2 font-mono text-xs" /><span className="mt-1 block text-xs text-[var(--muted)]">Each item: input, expectedOutput, and optional explanation.</span></label>
        <div className="flex gap-2"><button disabled={saving} className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : editingSlug ? 'Save changes' : 'Create problem'}</button>{editingSlug && <button type="button" onClick={reset} className="rounded-lg border border-[var(--border)] px-4 py-2">Cancel edit</button>}</div>
      </form>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="text-lg font-semibold">Existing problems</h2>{loading && !loaded && <p role="status" className="py-6 text-sm text-[var(--muted)]">Loading problems…</p>}{!loading && error && !loaded && <p className="py-6 text-sm text-[var(--muted)]">Problem list unavailable.</p>}{loaded && problems.length === 0 && <p className="py-6 text-sm text-[var(--muted)]">No problems yet.</p>}<ul className="mt-4 space-y-3">{problems.map(problem => <li key={problem._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3"><div className="min-w-0"><p className="truncate font-medium">{problem.title}</p><p className="mt-1 text-xs capitalize text-[var(--muted)]">{problem.difficulty} · {problem.status}</p></div><div className="flex gap-2"><button onClick={() => edit(problem)} className="rounded-md border border-[var(--border)] px-3 py-2 text-xs">Edit</button><button disabled={saving} onClick={() => remove(problem)} className="rounded-md border border-red-300 px-3 py-2 text-xs text-red-700 disabled:opacity-50">Delete</button></div></li>)}</ul></section>
    </div>
  </div>
}
