import { useState } from 'react'
import { Link } from 'react-router-dom'
import { navigation } from './navigation'
import Icon from './Icon'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const matches = navigation.filter(({ label }) => label.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <div className="relative min-w-0 flex-1" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}>
      <label className="flex h-10 items-center gap-3 rounded-lg border border-white/10 bg-zinc-950/60 px-3 text-zinc-500 focus-within:border-violet-400/70">
        <Icon name="search" className="size-4 shrink-0" />
        <span className="sr-only">Search navigation</span>
        <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Search DevHub…" className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
      </label>
      {open && query.trim() && <div className="absolute inset-x-0 top-12 z-50 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
        <p className="px-3 py-2 text-xs text-zinc-500">Go to page</p>
        {matches.length ? matches.map(({ label, to }) => <Link key={to} to={to} onClick={() => { setQuery(''); setOpen(false) }} className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white">{label}</Link>) : <p className="px-3 py-2 text-sm text-zinc-400" role="status">No matching pages.</p>}
      </div>}
    </div>
  )
}
