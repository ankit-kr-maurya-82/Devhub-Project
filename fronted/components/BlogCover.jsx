import Icon from './Icon'

const accents = {
  violet: 'text-[var(--accent)]',
  emerald: 'text-[var(--success)]',
  amber: 'text-[var(--warning)]',
}

export default function BlogCover({ category = 'Community', icon = 'code', accent = 'violet', large = false }) {
  return (
    <div role="img" aria-label={`${category} cover placeholder`} className={`flex items-center gap-4 bg-[var(--surface-raised)] px-5 ${accents[accent] || accents.violet} ${large ? 'min-h-32 rounded-xl border border-[var(--border)] sm:min-h-40 sm:px-8' : 'h-24 border-b border-[var(--border)]'}`}>
      <Icon name={icon} className={large ? 'size-10 shrink-0' : 'size-7 shrink-0'} />
      <span className="text-sm font-medium normal-case">{category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}</span>
    </div>
  )
}
