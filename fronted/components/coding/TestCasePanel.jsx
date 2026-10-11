export default function TestCasePanel({ cases = [] }) {
  if (!cases.length) return <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><h2 className="text-sm font-semibold">Sample cases</h2><p className="mt-2 text-sm text-[var(--muted)]">No sample cases provided.</p></section>
  return (
    <section aria-labelledby="sample-cases-heading" className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-4 py-3"><h2 id="sample-cases-heading" className="text-sm font-semibold">Sample cases</h2><p className="mt-1 text-xs text-[var(--muted)]">Reference examples only; they are not executed in your browser.</p></div>
      <div className="space-y-4 p-4">{cases.map((testCase, index) => <article key={index} className="grid gap-3 sm:grid-cols-2"><h3 className="sm:col-span-2 text-xs font-semibold text-[var(--muted)]">Sample {index + 1}</h3><div><p className="mb-2 text-xs font-medium text-[var(--muted)]">Input</p><pre className="min-h-14 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--surface-raised)] p-3 font-mono text-xs leading-5">{testCase.input}</pre></div><div><p className="mb-2 text-xs font-medium text-[var(--muted)]">Expected output</p><pre className="min-h-14 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--surface-raised)] p-3 font-mono text-xs leading-5">{testCase.expectedOutput}</pre></div>{testCase.explanation && <p className="sm:col-span-2 text-sm text-[var(--muted)]">{testCase.explanation}</p>}</article>)}</div>
    </section>
  )
}
