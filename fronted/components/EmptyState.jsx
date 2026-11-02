export default function EmptyState({ title, description, action, className = '' }) {
  return (
    <section className={`ui-card px-5 py-10 text-center sm:px-8 ${className}`.trim()}>
      <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-prose text-sm leading-6 text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  )
}
