import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postQuestion } from '../hooks/useQuestions'
import QuestionContent from '../components/QuestionContent'
import { popularTags } from '../data/home'

const fields = [
  { name: 'title', label: 'Title', help: 'Be specific. 15–150 characters.', min: 15, max: 150, placeholder: 'e.g. Why does my React effect run twice in development?' },
  { name: 'description', label: 'Description', help: 'Include the expected result and what you tried. 30–15,000 characters.', min: 30, max: 15000, rows: 7, placeholder: 'Give the community enough context to reproduce the problem…' },
  { name: 'code', label: 'Code example (optional)', help: 'Paste a minimal example. Code is displayed as text and is never executed.', max: 15000, rows: 7, placeholder: '// Your code here' },
  { name: 'tags', label: 'Tags', help: 'Add 1–5 tags separated by commas, each up to 25 characters.', max: 150, placeholder: 'React, JavaScript' },
]

export default function AskQuestion() {
  const navigate = useNavigate()
  const previewRef = useRef(null)
  const previewButton = useRef(null)
  const [form, setForm] = useState({ title: '', description: '', code: '', tags: '' })
  const [preview, setPreview] = useState(false)
  const [errors, setErrors] = useState({})
  const tags = [...new Set(form.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => popularTags.find(value => value.toLowerCase() === tag.toLowerCase()) || tag.toLowerCase()))]

  const updateField = event => {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
    setErrors(current => ({ ...current, [name]: undefined }))
  }
  const togglePreview = () => {
    setPreview(!preview)
    requestAnimationFrame(() => (preview ? previewButton.current : previewRef.current)?.focus())
  }
  const submit = event => {
    event.preventDefault()
    const nextErrors = {}
    if (form.title.trim().length < 15 || form.title.length > 150) nextErrors.title = 'Use 15–150 characters for your title.'
    if (form.description.trim().length < 30 || form.description.length > 15000) nextErrors.description = 'Write 30–15,000 characters describing the problem.'
    if (form.code.length > 15000) nextErrors.code = 'Keep your code example under 15,000 characters.'
    if (!tags.length || tags.length > 5 || tags.some(tag => tag.length > 25 || !/^[a-z0-9][a-z0-9.+#-]*$/i.test(tag))) nextErrors.tags = 'Use 1–5 tags with letters, numbers, dots, +, #, or hyphens. Up to 25 characters each.'
    setErrors(nextErrors)
    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      event.currentTarget.elements.namedItem(firstInvalidField)?.focus()
      return
    }
    const id = postQuestion({ title: form.title.trim(), description: form.description.trim(), code: form.code.trim(), tags })
    navigate(`/questions/${id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link to="/questions" className="inline-block text-sm text-violet-300 hover:text-violet-200">← Back to questions</Link>
      <header><h1>Ask a Question</h1><p className="mt-3 text-sm text-zinc-400">A clear question is the first step toward a great answer.</p></header>
      <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-5 text-sm leading-6 text-zinc-400"><span className="font-medium text-violet-300">Make it easy to help.</span> Describe your goal, what you tried, and what happened. Include a small code example when it helps.</div>
      <form onSubmit={submit} noValidate className="space-y-6 rounded-xl border border-white/10 bg-[#121317] p-5 sm:p-8">
        {fields.map(field => {
          const props = {
            id: `question-${field.name}`, name: field.name, value: form[field.name], onChange: updateField,
            required: field.name !== 'code', minLength: field.min, maxLength: field.max, placeholder: field.placeholder,
            'aria-invalid': Boolean(errors[field.name]), 'aria-describedby': `${field.name}-help${errors[field.name] ? ` ${field.name}-error` : ''}`,
            className: `mt-2 w-full rounded-lg border bg-[#0c0d10] p-3 text-sm leading-6 text-zinc-200 focus:outline-violet-400 ${errors[field.name] ? 'border-rose-400/60' : 'border-white/10 focus:border-violet-400'} ${field.name === 'code' ? 'font-mono text-violet-200' : ''}`,
          }
          return <div key={field.name}>
            <label htmlFor={props.id} className="text-sm font-semibold">{field.label}</label>
            <p id={`${field.name}-help`} className="mt-1 text-xs leading-5 text-zinc-400">{field.help}</p>
            {field.rows ? <textarea {...props} rows={field.rows} spellCheck={field.name !== 'code'} /> : <input {...props} />}
            {errors[field.name] && <p id={`${field.name}-error`} role="alert" className="mt-2 text-xs text-rose-300">{errors[field.name]}</p>}
            {field.name === 'tags' && <div className="mt-3 flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="max-w-full break-all rounded-md bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-300">{tag}</span>)}</div>}
          </div>
        })}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5"><button ref={previewButton} type="button" onClick={togglePreview} aria-expanded={preview} aria-controls={preview ? 'question-preview' : undefined} className="rounded-lg border border-white/15 px-5 py-3 text-sm hover:bg-white/5">{preview ? 'Hide Preview' : 'Preview'}</button><button type="submit" className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Post Question</button></div>
        {preview && <section ref={previewRef} tabIndex={-1} id="question-preview" aria-label="Question preview" className="min-w-0 space-y-4 rounded-xl border border-violet-400/20 bg-[#0c0d10] p-5 outline-none"><p className="font-mono text-xs text-violet-400">PREVIEW</p><h2 className="break-words text-xl font-semibold">{form.title || 'Your question title'}</h2><QuestionContent body={form.description || 'Your description will appear here.'} code={form.code} /><div className="flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="max-w-full break-all text-xs text-violet-300">#{tag}</span>)}</div></section>}
        <p className="text-xs text-zinc-500">Frontend demo · your question is available until the page is reloaded.</p>
      </form>
    </div>
  )
}
