export default function LoadingState() {
  return (
    <section role="status" aria-live="polite" aria-busy="true" className="mx-auto w-full max-w-4xl space-y-5 p-6 sm:p-10">
      <p className="text-sm text-violet-300">Loading DevHub…</p>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-8 w-2/3 rounded-lg bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/5" />
        <div className="h-48 rounded-xl border border-white/10 bg-[#121317]" />
        <div className="h-32 rounded-xl border border-white/10 bg-[#121317]" />
      </div>
    </section>
  )
}
