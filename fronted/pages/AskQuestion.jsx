import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postQuestion } from '../hooks/useQuestions'
import QuestionContent from '../components/QuestionContent'
import { popularTags } from '../data/home'

const inputClass = 'mt-2 w-full rounded-lg border border-white/10 bg-[#0c0d10] p-3 text-sm leading-6 text-zinc-200 focus:border-violet-400 focus:outline-none'

export default function AskQuestion() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const tags = [...new Set(tagInput.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => popularTags.find(value => value.toLowerCase() === tag.toLowerCase()) || tag.toLowerCase()))]
  const submit = event => {
    event.preventDefault()
    if (title.trim().length < 15 || description.trim().length < 30) { setError('Add a title of at least 15 characters and a description of at least 30 characters.'); return }
    if (!tags.length || tags.length > 5 || tags.some(tag => tag.length > 25 || !/^[a-z0-9][a-z0-9.+#-]*$/i.test(tag))) { setError('Use 1–5 comma-separated tags, up to 25 characters each. Use letters, numbers, dots, +, #, or hyphens.'); return }
    const id = postQuestion({ title: title.trim(), description: description.trim(), code: code.trim(), tags })
    navigate(`/questions/${id}`)
  }
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link to="/questions" className="text-sm text-violet-300">← Back to questions</Link>
      <header><h1>Ask a Question</h1><p className="mt-3 text-sm text-zinc-400">A clear question is the first step toward a great answer.</p></header>
      <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-5 text-sm leading-6 text-zinc-400"><span className="font-medium text-violet-300">Make it easy to help.</span> Describe your goal, what you tried, and what happened. Include a small code example when it helps.</div>
      <form onSubmit={submit} className="space-y-6 rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-8">
        <div><label htmlFor="question-title" className="text-sm font-semibold">Title</label><p id="title-help" className="mt-1 text-xs text-zinc-500">Be specific. 15–150 characters.</p><input id="question-title" value={title} onChange={event => setTitle(event.target.value)} required minLength={15} maxLength={150} aria-describedby="title-help" placeholder="e.g. Why does my React effect run twice in development?" className={inputClass} /></div>
        <div><label htmlFor="question-description" className="text-sm font-semibold">Description</label><p id="description-help" className="mt-1 text-xs text-zinc-500">Include the expected result and what you have tried. At least 30 characters.</p><textarea id="question-description" value={description} onChange={event => setDescription(event.target.value)} required minLength={30} maxLength={15000} rows={7} aria-describedby="description-help" placeholder="Give the community enough context to reproduce the problem…" className={inputClass} /></div>
        <div><label htmlFor="question-code" className="text-sm font-semibold">Code example <span className="font-normal text-zinc-500">(optional)</span></label><p id="code-help" className="mt-1 text-xs text-zinc-500">Paste a minimal example. Code is displayed as text and is never executed.</p><textarea id="question-code" value={code} onChange={event => setCode(event.target.value)} maxLength={15000} rows={7} spellCheck={false} aria-describedby="code-help" placeholder="// Your code here" className={`${inputClass} font-mono text-violet-200`} /></div>
        <div><label htmlFor="question-tags" className="text-sm font-semibold">Tags</label><p id="tags-help" className="mt-1 text-xs text-zinc-500">Add 1–5 tags separated by commas, e.g. React, JavaScript.</p><input id="question-tags" value={tagInput} onChange={event => setTagInput(event.target.value)} required maxLength={150} aria-describedby="tags-help" placeholder="React, JavaScript" className={inputClass} /><div className="mt-3 flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="max-w-full break-all rounded-md bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-300">{tag}</span>)}</div></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5"><button type="button" onClick={() => setPreview(value => !value)} aria-expanded={preview} aria-controls="question-preview" className="rounded-lg border border-white/15 px-5 py-3 text-sm hover:bg-white/5">{preview ? 'Hide Preview' : 'Preview'}</button><button type="submit" className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Post Question</button></div>
        <p role="alert" className="text-sm text-rose-300">{error}</p>
        {preview && <section id="question-preview" aria-label="Question preview" className="min-w-0 space-y-4 rounded-xl border border-violet-400/20 bg-[#0c0d10] p-5"><p className="font-mono text-xs text-violet-400">PREVIEW</p><h2 className="break-words text-xl font-semibold">{title || 'Your question title'}</h2><QuestionContent body={description || 'Your description will appear here.'} code={code} /><div className="flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="max-w-full break-all text-xs text-violet-300">#{tag}</span>)}</div></section>}
        <p className="text-xs text-zinc-500">Frontend demo · your question is available until the page is reloaded.</p>
      </form>
    </div>
  )
}
