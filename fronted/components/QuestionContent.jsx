export default function QuestionContent({ body, code }) {
  return (
    <div className="min-w-0 space-y-5">
      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text)]">{body}</p>
      {code && <pre className="max-w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--page)] p-4 text-xs leading-6 text-[var(--accent)]" tabIndex={0} aria-label="Code sample"><code>{code}</code></pre>}
    </div>
  )
}
