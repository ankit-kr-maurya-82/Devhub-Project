import { Link } from 'react-router-dom'

export default function ComingSoon({ title, description }) {
  return (
    <section className="mx-auto max-w-2xl">
      <h1>{title}</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
      <div className="ui-card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Coming soon</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">This page is still being built. You can browse questions while you wait.</p>
        <Link to="/questions" className="ui-button mt-5">Browse questions</Link>
      </div>
    </section>
  )
}
