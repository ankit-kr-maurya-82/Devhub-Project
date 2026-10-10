export default function TypingIndicator({ name }) {
  if (!name) return null
  return (
    <div role="status" className="flex min-h-7 shrink-0 items-center gap-2 px-5 text-xs text-[var(--muted)] sm:px-8">
      <span aria-hidden="true" className="flex items-center gap-0.5">
        <span className="size-1 rounded-full bg-[var(--primary-hover)] motion-safe:animate-pulse" />
        <span className="size-1 rounded-full bg-[var(--primary-hover)] motion-safe:animate-pulse [animation-delay:150ms]" />
        <span className="size-1 rounded-full bg-[var(--primary-hover)] motion-safe:animate-pulse [animation-delay:300ms]" />
      </span>
      <span><span className="font-medium text-[var(--muted)]">{name}</span> is typing...</span>
    </div>
  )
}
