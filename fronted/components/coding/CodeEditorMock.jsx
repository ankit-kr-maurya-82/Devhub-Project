export default function CodeEditorMock({ language, value, onChange }) {
  const lines = Math.max(12, value.split('\n').length)
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] focus-within:border-[var(--accent)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2.5 sm:px-4"><span className="text-xs font-semibold text-[var(--text)]">Your solution</span><span className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--muted)]">{language}</span></div>
      <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] sm:grid-cols-[2.75rem_minmax(0,1fr)]">
        <pre aria-hidden="true" className="select-none overflow-hidden border-r border-[var(--border)] py-4 pr-2 text-right font-mono text-xs leading-6 text-[var(--subtle)] sm:text-sm">{Array.from({ length: lines }, (_, index) => index + 1).join('\n')}</pre>
        <textarea aria-label={`${language} solution`} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" value={value} onChange={event => onChange(event.target.value)} rows={lines} className="min-h-80 min-w-0 w-full resize-y overflow-auto bg-transparent p-3 font-mono text-xs leading-6 text-[var(--text)] outline-none placeholder:text-[var(--subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] sm:p-4 sm:text-sm" />
      </div>
    </div>
  )
}
