import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="ui-card mx-auto max-w-2xl px-6 py-12 text-center sm:px-10">
      <p className="mb-3 text-sm font-medium text-[var(--muted)]">Error 404</p>
      <h1>Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Check the address or choose a page below.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="ui-button">Back to home</Link>
        <Link to="/questions" className="ui-button-secondary">Browse questions</Link>
      </div>
    </section>
  )
}
