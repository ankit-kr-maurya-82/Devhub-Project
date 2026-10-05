import Icon from '../../../components/Icon.jsx'

export default function AdminStatCard({ label, value, icon = 'grid', description, tone = 'accent' }) {
  const colors = { accent: 'var(--accent)', success: 'var(--success)', warning: 'var(--warning)' }
  return <article className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[var(--muted)]">{label}</p><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-raised)]" style={{ color: colors[tone] || colors.accent }}><Icon name={icon} className="size-4" /></span></div><p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">{Number(value || 0).toLocaleString()}</p>{description && <p className="mt-2 text-xs leading-5 text-[var(--subtle)]">{description}</p>}</article>
}
