export default function TypingIndicator({ name = 'Rahul' }) {
  return (
    <div role="status" className="flex min-h-7 shrink-0 items-center gap-2 px-5 text-[11px] text-zinc-500 sm:px-8">
      <span aria-hidden="true" className="flex items-center gap-0.5">
        <span className="size-1 rounded-full bg-violet-400 motion-safe:animate-pulse" />
        <span className="size-1 rounded-full bg-violet-400 motion-safe:animate-pulse [animation-delay:150ms]" />
        <span className="size-1 rounded-full bg-violet-400 motion-safe:animate-pulse [animation-delay:300ms]" />
      </span>
      <span><span className="font-medium text-zinc-400">{name}</span> is typing...</span>
    </div>
  )
}
