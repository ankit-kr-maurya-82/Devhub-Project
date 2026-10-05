export default function CodeEditorMock({ language, value, onChange }) {
  const lines = Math.max(12, value.split('\n').length)
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] focus-within:border-[var(--accent)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3"><span className="text-xs font-medium text-[var(--accent)]">Your solution</span><span className="text-xs text-[var(--subtle)]">Preview · {language}</span></div>
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
        <pre aria-hidden="true" className="select-none overflow-hidden border-r border-[var(--border)] py-4 pr-2 text-right font-mono text-sm leading-6 text-[var(--subtle)]">{Array.from({ length: lines }, (_, index) => index + 1).join('\n')}</pre>
        <textarea aria-label={`${language} solution`} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" value={value} onChange={event => onChange(event.target.value)} rows={lines} className="min-h-72 w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 text-[var(--text)] outline-none placeholder:text-[var(--subtle)]" />
      </div>
    </div>
  )
}
