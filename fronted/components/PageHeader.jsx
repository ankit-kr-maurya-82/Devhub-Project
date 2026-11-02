export default function PageHeader({ eyebrow, title, description, action, children, className = '' }) {
  return (
    <header className={`ui-page-header ${className}`.trim()}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-sm font-semibold text-[var(--accent)]">{eyebrow}</p>}
        <h1 className="ui-page-header-title">{title}</h1>
        {description && <p className="ui-page-header-description">{description}</p>}
      </div>
      {(action || children) && <div className="flex flex-wrap items-center gap-2">{action || children}</div>}
    </header>
  )
}
