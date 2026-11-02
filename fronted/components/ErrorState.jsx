export default function ErrorState({ title = 'Something went wrong', description, onRetry, retryLabel = 'Try again', className = '' }) {
  return (
    <section role="alert" className={`ui-card border-[var(--danger)] bg-[var(--danger-soft)] p-4 sm:p-5 ${className}`.trim()}>
      <h2 className="text-sm font-semibold text-[var(--danger)]">{title}</h2>
      {description && <p className="mt-1 text-sm leading-6 text-[var(--text)]">{description}</p>}
      {onRetry && <button type="button" onClick={onRetry} className="ui-button-secondary mt-4">{retryLabel}</button>}
    </section>
  )
}
