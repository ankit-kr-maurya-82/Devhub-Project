export default function Skeleton({ className = '' }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-[var(--surface-raised)] ${className}`.trim()} />
}
