import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { navigationFor } from './navigation'
import Icon from './Icon'
import { useMockSession } from '../src/state/useMockSession.js'
import api from '../src/lib/api.js'

export default function SearchBar() {
  const { user, role } = useMockSession()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const trimmed = query.trim()
  const canSearchMembers = Boolean(user)
  const pages = navigationFor(user, role).filter(item => item.label.toLowerCase().includes(trimmed.toLowerCase()))

  useEffect(() => {
    if (trimmed.length < 2) return undefined
    let active = true
    const timer = setTimeout(async () => {
      setLoading(true); setError('')
      try {
        const [questions, blogs, members] = await Promise.all([
          api.questions.list({ search: trimmed, limit: '5' }),
          api.blogs.list({ search: trimmed, limit: '5' }),
          canSearchMembers ? api.users.search(trimmed) : Promise.resolve({ data: [] }),
        ])
        if (!active) return
        const questionResults = questions.data.map(item => ({ type: 'Question', title: item.title, detail: `@${item.author?.username || 'member'} · ${(item.tags || []).slice(0, 3).join(', ')}`, to: `/questions/${item._id}` }))
        const blogResults = blogs.data.map(item => ({ type: 'Blog', title: item.title, detail: `@${item.author?.username || 'member'} · ${(item.tags || []).slice(0, 3).join(', ')}`, to: `/blogs/${item.slug}` }))
        // Authors are included in content search, making usernames searchable too.
        const memberResults = members.data.map(member => ({ type: 'Member', title: member.name || `@${member.username}`, detail: `@${member.username}`, to: `/profile?user=${member._id}` }))
        setResults([...memberResults, ...questionResults, ...blogResults])
      } catch (reason) { if (active) setError(reason.message || 'Search is unavailable.') }
      finally { if (active) setLoading(false) }
    }, 250)
    return () => { active = false; clearTimeout(timer) }
  }, [trimmed, canSearchMembers])

  const close = () => { setQuery(''); setOpen(false); setResults([]) }
  return (
    <div className="relative min-w-0 flex-1" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
      <label className="flex h-10 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-[var(--subtle)] focus-within:border-[var(--accent)]">
        <Icon name="search" className="size-4 shrink-0" />
        <span className="sr-only">Search questions, blogs, and members</span>
        <input type="search" value={query} onChange={event => { setQuery(event.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Search questions, blogs, people…" className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--subtle)]" />
      </label>
      {open && trimmed && <div className="absolute inset-x-0 top-12 z-50 max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
        {pages.length > 0 && <><p className="px-3 py-2 text-xs text-[var(--subtle)]">Pages</p>{pages.map(({ label, to }) => <Link key={to} to={to} onClick={close} className="block rounded-lg px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-raised)]">{label}</Link>)}</>}
        {trimmed.length < 2 ? <p className="px-3 py-2 text-xs text-[var(--muted)]">Type at least 2 characters to search content.</p> : <>
          <p className="px-3 py-2 text-xs text-[var(--subtle)]">Questions, blogs, and members</p>
          {loading && <p role="status" className="px-3 py-2 text-sm text-[var(--muted)]">Searching…</p>}
          {error && <p role="status" className="px-3 py-2 text-sm text-[var(--danger)]">{error}</p>}
          {!loading && !error && trimmed.length >= 2 && results.map((result, index) => <Link key={`${result.type}-${result.to}-${index}`} to={result.to} onClick={close} className="block rounded-lg px-3 py-2 hover:bg-[var(--surface-raised)]"><span className="mr-2 rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--accent)]">{result.type}</span><span className="text-sm text-[var(--text)]">{result.title}</span><span className="mt-1 block truncate text-xs text-[var(--muted)]">{result.detail}</span></Link>)}
          {!loading && !error && trimmed.length >= 2 && !results.length && <p className="px-3 py-2 text-sm text-[var(--muted)]" role="status">No matching content found.</p>}
        </>}
      </div>}
    </div>
  )
}
