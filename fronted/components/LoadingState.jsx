import Skeleton from './Skeleton'

export default function LoadingState() {
  return (
    <section role="status" aria-live="polite" aria-busy="true" className="mx-auto w-full max-w-4xl space-y-5 p-5 sm:p-10">
      <p className="text-sm text-[var(--accent)]">Loading DevHub…</p>
      <div aria-hidden="true" className="space-y-4 motion-reduce:animate-none">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <div className="ui-card h-48 motion-safe:animate-pulse" />
        <div className="ui-card h-32 motion-safe:animate-pulse" />
      </div>
    </section>
  )
}
