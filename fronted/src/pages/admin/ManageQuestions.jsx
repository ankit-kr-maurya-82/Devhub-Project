import { useState } from 'react'
import ContentTable from '../../components/admin/ContentTable.jsx'
import { AdminPageHeader, ContentDetails, Feedback, TableToolbar } from '../../components/admin/AdminUI.jsx'
import { useAdmin } from '../../state/useAdmin.js'

export default function ManageQuestions() {
  const { questions, updateContentStatus } = useAdmin()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const search = query.trim().toLowerCase()
  const filtered = questions
    .filter(item =>
      (status === 'all' || item.status === status) &&
      `${item.title} ${item.author} ${item.tags.join(' ')}`
        .toLowerCase().includes(search))
  const selected = questions.find(item => item.id === selectedId)


  function changeStatus(id, nextStatus) {
    const item = questions.find(question => question.id === id)
    if (!item || item.status === nextStatus) return
    updateContentStatus('question', id, nextStatus)
    setFeedback(`“${item.title}” ${nextStatus === 'published' ? 'was restored' : `is now ${nextStatus}`}.`)
  }

  return <div className="min-w-0"><AdminPageHeader title="Manage questions" description="Review discussions, protect useful answers, and keep questions on track." count={questions.length} /><Feedback message={feedback} /><TableToolbar query={query} onQueryChange={setQuery} queryLabel="Search questions" status={status} onStatusChange={setStatus} statuses={['published', 'hidden', 'deleted']} resultCount={filtered.length} /><ContentTable items={filtered} type="question" onView={setSelectedId} onStatusChange={changeStatus} />{selected && <ContentDetails item={selected} type="question" onClose={() => setSelectedId(null)} />}</div>
}
