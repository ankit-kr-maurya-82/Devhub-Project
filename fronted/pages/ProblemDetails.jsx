import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CodeEditorMock from '../components/coding/CodeEditorMock'
import DifficultyBadge from '../components/coding/DifficultyBadge'
import TestCasePanel from '../components/coding/TestCasePanel'
import { codingProblems, getStarterCode, getTestCases, languages } from '../data/coding'

export default function ProblemDetails() {
  const { id } = useParams()
  const problem = codingProblems.find(item => item.id === id)
  const [language, setLanguage] = useState('JavaScript')
  const [code, setCode] = useState(() => getStarterCode(problem, 'JavaScript'))
  const [results, setResults] = useState([])
  const [activeCase, setActiveCase] = useState(0)
  const [notice, setNotice] = useState('')

  const changeLanguage = value => {
    setLanguage(value)
    setCode(getStarterCode(problem, value))
    setResults([])
    setNotice('')
  }

  if (!problem) return <section className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center"><p className="mb-3 text-sm text-[var(--accent)]">Problem not found</p><h1>This problem isn’t available.</h1><p className="mt-4 text-sm text-[var(--muted)]">Choose a problem from the coding practice library.</p><Link to="/coding" className="mt-6 inline-block text-[var(--accent)]">Browse problems →</Link></section>

  const testCases = getTestCases(problem)
  const runCode = () => {
    setResults(testCases.map(testCase => ({ output: testCase.expected, status: 'Passed' })))
    setNotice(`${testCases.length} sample ${testCases.length === 1 ? 'test case' : 'test cases'} shown as passed. Your code was not executed.`)
  }
  const submit = () => {
    setResults(testCases.map(testCase => ({ output: testCase.expected, status: 'Passed' })))
    setNotice('Sample submission shown. Your code was not executed or saved.')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/coding" className="rounded text-sm text-[var(--accent)] hover:text-[var(--accent)]">← All problems</Link><Link to="/submissions" className="rounded text-sm text-[var(--muted)] hover:text-[var(--accent)]">Submission history →</Link></div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3"><DifficultyBadge difficulty={problem.difficulty} />{problem.solved && <span className="text-xs font-medium text-[var(--success)]">✓ Solved</span>}</div>
          <h1 className="mt-4 break-words">{problem.title}</h1>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">{problem.description}</p>
          <section aria-labelledby="examples-heading" className="mt-8"><h2 id="examples-heading" className="text-base font-semibold">Example</h2>{problem.examples.map((example, index) => <div key={index} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4"><p className="font-mono text-xs text-[var(--subtle)]">Example {index + 1}</p><dl className="mt-3 space-y-3 text-sm"><div><dt className="text-xs text-[var(--subtle)]">Input</dt><dd><pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-[var(--text)]">{example.input}</pre></dd></div><div><dt className="text-xs text-[var(--subtle)]">Output</dt><dd><pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-[var(--success)]">{example.output}</pre></dd></div>{example.explanation && <div><dt className="text-xs text-[var(--subtle)]">Explanation</dt><dd className="mt-1 text-sm leading-6 text-[var(--muted)]">{example.explanation}</dd></div>}</dl></div>)}</section>
          <section aria-labelledby="constraints-heading" className="mt-8"><h2 id="constraints-heading" className="text-base font-semibold">Constraints</h2><ul className="mt-3 space-y-2">{problem.constraints.map(item => <li key={item} className="rounded-lg bg-[var(--surface-raised)] px-3 py-2 font-mono text-xs leading-5 text-[var(--muted)]">{item}</li>)}</ul></section>
          <div className="mt-8 flex flex-wrap gap-2">{problem.tags.map(tag => <span key={tag} className="rounded-md border border-[var(--border)] bg-[var(--accent-soft)] px-2.5 py-1 text-sm text-[var(--accent)]">{tag}</span>)}</div>
        </article>

        <section aria-label="Solution workspace" className="min-w-0 space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><label htmlFor="coding-language" className="text-sm font-medium text-[var(--text)]">Language<select id="coding-language" value={language} onChange={event => changeLanguage(event.target.value)} className="mt-2 block min-h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]">{languages.map(item => <option key={item}>{item}</option>)}</select></label><p className="text-xs text-[var(--subtle)]">Code is not executed or saved in this preview.</p></div>
            <CodeEditorMock language={language} value={code} onChange={value => { setCode(value); setNotice(''); setResults([]) }} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p role="status" aria-live="polite" className="min-h-5 flex-1 text-xs leading-5 text-[var(--accent)]">{notice}</p><div className="flex flex-wrap gap-3"><button type="button" onClick={runCode} className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-raised)]">Preview tests</button><button type="button" onClick={submit} className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]">Preview submission</button></div></div>
          </div>
          <TestCasePanel cases={testCases} results={results} activeCase={activeCase} onCaseChange={setActiveCase} />
        </section>
      </div>
    </div>
  )
}
