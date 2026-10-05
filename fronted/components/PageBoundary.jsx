import { Component, Suspense } from 'react'
import LoadingState from './LoadingState'

export default class PageBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <section role="alert" className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10">
          <h1>This page couldn’t load</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Check your connection and reload to try again.</p>
          <button type="button" onClick={() => window.location.reload()} className="ui-button mt-6">Reload page</button>
          <a href="/" className="ml-4 inline-block rounded py-3 text-sm text-[var(--accent)] hover:underline">Back to home</a>
        </section>
      )
    }
    return <Suspense fallback={<LoadingState />}>{this.props.children}</Suspense>
  }
}
