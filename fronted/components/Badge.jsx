const variants = {
  neutral: '',
  accent: 'ui-badge-accent',
  success: 'ui-badge-success',
  warning: 'ui-badge-warning',
  danger: 'ui-badge-danger',
  info: 'ui-badge-info',
}

export default function Badge({ variant = 'neutral', children, className = '' }) {
  return <span className={`ui-badge ${variants[variant] || variants.neutral} ${className}`.trim()}>{children}</span>
}
