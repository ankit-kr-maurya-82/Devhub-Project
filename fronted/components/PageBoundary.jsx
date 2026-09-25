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
        <section role="alert" className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-[#121317] p-6 sm:p-10">
          <h1>This page couldn’t load</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Check your connection and reload to try again.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">Reload page</button>
          <a href="/" className="ml-4 inline-block rounded py-3 text-sm text-violet-300">Back to home</a>
        </section>
      )
    }
    return <Suspense fallback={<LoadingState />}>{this.props.children}</Suspense>
  }
}
