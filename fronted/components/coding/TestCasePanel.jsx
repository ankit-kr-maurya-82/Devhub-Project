export default function TestCasePanel({ cases, results = [], activeCase, onCaseChange }) {
  const testCase = cases[activeCase]
  const result = results[activeCase]
  return (
    <section aria-labelledby="test-cases-heading" className="overflow-hidden rounded-xl border border-white/10 bg-[#121317]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><h2 id="test-cases-heading" className="text-sm font-semibold">Test Cases</h2><span className="text-[11px] text-zinc-500">UI preview only</span></div>
      <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-3 pt-3" role="tablist" aria-label="Test cases">
        {cases.map((_, index) => <button key={index} type="button" role="tab" aria-selected={activeCase === index} onClick={() => onCaseChange(index)} className={`shrink-0 rounded-t-lg px-3 py-2 text-xs ${activeCase === index ? 'bg-white/5 text-violet-300' : 'text-zinc-500 hover:text-zinc-200'}`}>Case {index + 1}</button>)}
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {[['Input', testCase.input], ['Expected Output', testCase.expected], ['Your Output', result?.output || 'Run code to see output']].map(([label, content]) => <div key={label} className={label === 'Your Output' ? 'sm:col-span-2' : ''}><p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p><pre className="min-h-14 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[#0c0d10] p-3 font-mono text-xs leading-5 text-zinc-300">{content}</pre></div>)}
        <div className="sm:col-span-2"><p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</p><span role="status" className={`text-sm font-medium ${result?.status === 'Passed' ? 'text-emerald-300' : result?.status ? 'text-amber-300' : 'text-zinc-500'}`}>{result?.status || 'Not run'}</span></div>
      </div>
    </section>
  )
}
