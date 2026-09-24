export default function QuestionContent({ body, code }) {
  return (
    <div className="min-w-0 space-y-5">
      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{body}</p>
      {code && <pre className="max-w-full overflow-x-auto rounded-xl border border-white/10 bg-[#090a0e] p-4 text-xs leading-6 text-violet-200" tabIndex={0} aria-label="Code sample"><code>{code}</code></pre>}
    </div>
  )
}
