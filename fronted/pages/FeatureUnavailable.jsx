import { Link } from 'react-router-dom'

export default function FeatureUnavailable({ title, description }) {
  return (
    <section className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
      <h1>{title}</h1>
      <p className="text-sm leading-6 text-[var(--muted)]">{description}</p>
      <p className="text-sm leading-6 text-[var(--muted)]">This feature is unavailable until it is connected to persistent backend data.</p>
      <Link to="/questions" className="ui-button-secondary inline-flex">Browse questions</Link>
    </section>
  )
}
