export default function CodeEditorMock({ language, value, onChange }) {
  const lines = Math.max(12, value.split('\n').length)
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090a0e] focus-within:border-violet-400/50">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3"><span className="font-mono text-[11px] uppercase tracking-wider text-violet-300">solution</span><span className="text-[11px] text-zinc-500">Mock editor · {language}</span></div>
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
        <pre aria-hidden="true" className="select-none overflow-hidden border-r border-white/5 py-4 text-right font-mono text-xs leading-6 text-zinc-700">{Array.from({ length: lines }, (_, index) => index + 1).join('\n')}</pre>
        <textarea aria-label={`${language} solution`} spellCheck={false} value={value} onChange={event => onChange(event.target.value)} rows={lines} className="min-h-72 w-full resize-y bg-transparent p-4 font-mono text-xs leading-6 text-zinc-200 outline-none placeholder:text-zinc-600" />
      </div>
    </div>
  )
}
