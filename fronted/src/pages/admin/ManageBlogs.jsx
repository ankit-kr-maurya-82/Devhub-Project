import { useState } from 'react'
import ContentTable from '../../components/admin/ContentTable.jsx'
import { AdminPageHeader, ContentDetails, Feedback, TableToolbar } from '../../components/admin/AdminUI.jsx'
import { useAdmin } from '../../state/useAdmin.js'

export default function ManageBlogs() {
  const { blogs, updateContentStatus } = useAdmin()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const search = query.trim().toLowerCase()
  const filtered = blogs.filter(item => (status === 'all' || item.status === status) && `${item.title} ${item.author} ${item.category}`.toLowerCase().includes(search))
  const selected = blogs.find(item => item.id === selectedId)

  function changeStatus(id, nextStatus) {
    const item = blogs.find(blog => blog.id === id)
    if (!item || item.status === nextStatus) return
    updateContentStatus('blog', id, nextStatus)
    setFeedback(`“${item.title}” ${nextStatus === 'published' ? 'was restored' : `is now ${nextStatus}`}.`)
  }

  return <div className="min-w-0">
    <AdminPageHeader
      title="Manage blogs"
      description="Review community writing and keep helpful, thoughtful articles in view."
      count={blogs.length} />
    <Feedback
      message={feedback} />
    <TableToolbar
      query={query}
      onQueryChange={setQuery}
      queryLabel="Search blogs"
      status={status}
      onStatusChange={setStatus}
      statuses={['published', 'hidden', 'deleted']}
      resultCount={filtered.length} />
    <ContentTable
      items={filtered}
      type="blog"
      onView={setSelectedId}
      onStatusChange={changeStatus} />
    {selected &&
      <ContentDetails
        item={selected}
        type="blog"
        onClose={() => setSelectedId(null)} />}
  </div>
}
