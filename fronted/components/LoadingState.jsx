export default function LoadingState() {
  return (
    <section role="status" aria-live="polite" aria-busy="true" className="mx-auto w-full max-w-4xl space-y-5 p-6 sm:p-10">
      <p className="text-sm text-[var(--accent)]">Loading DevHub…</p>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-8 w-2/3 rounded-lg bg-[var(--surface-raised)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--surface-raised)]" />
        <div className="h-48 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
        <div className="h-32 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
      </div>
    </section>
  )
}
