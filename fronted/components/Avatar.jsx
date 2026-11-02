export default function Avatar({ name = 'User', src, size = 'md', className = '' }) {
  const displayName = typeof name === 'string' && name.trim() ? name.trim() : 'User'
  const sizeClass = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' }[size] || 'size-10 text-sm'
  const initials = displayName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()

  return (
    <span role="img" aria-label={`${displayName} avatar`} className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--accent-soft)] font-semibold text-[var(--accent)] ${sizeClass} ${className}`}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials}
    </span>
  )
}
