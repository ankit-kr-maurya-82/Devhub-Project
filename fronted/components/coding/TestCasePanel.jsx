export default function TestCasePanel({ cases, results = [], activeCase, onCaseChange }) {
  const testCase = cases[activeCase]
  const result = results[activeCase]
  return (
    <section aria-labelledby="test-cases-heading" className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3"><h2 id="test-cases-heading" className="text-sm font-semibold">Test cases</h2><span className="text-xs text-[var(--subtle)]">Sample results only</span></div>
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--border)] p-3" role="group" aria-label="Choose a test case">
        {cases.map((_, index) => <button key={index} type="button" aria-pressed={activeCase === index} onClick={() => onCaseChange(index)} className={`min-h-10 shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${activeCase === index ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}>Case {index + 1}</button>)}
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2" aria-label={`Test case ${activeCase + 1}`}>
        {[['Input', testCase.input], ['Expected output', testCase.expected], ['Sample output', result?.output || 'Select Preview tests to see sample output.']].map(([label, content]) => <div key={label} className={`min-w-0 ${label === 'Sample output' ? 'sm:col-span-2' : ''}`}><p className="mb-2 text-xs font-medium text-[var(--muted)]">{label}</p><pre className="min-h-14 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--surface-raised)] p-3 font-mono text-xs leading-5 text-[var(--text)]">{content}</pre></div>)}
        <div className="sm:col-span-2"><p className="mb-2 text-xs font-medium text-[var(--muted)]">Sample result</p><span role="status" className={`text-sm font-medium ${result?.status === 'Passed' ? 'text-[var(--success)]' : result?.status ? 'text-[var(--warning)]' : 'text-[var(--subtle)]'}`}>{result?.status || 'Not previewed'}</span></div>
      </div>
    </section>
  )
}
