import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../src/lib/api.js'
import { useMockSession } from '../src/state/useMockSession.js'

export default function CommentThread({ targetType, targetId }) {
  const { user } = useMockSession()
  const currentUserId = String(user?.id || user?._id || '')
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const listComments = targetType === 'Question' ? api.comments.questionList : api.comments.answerList
  const addComment = targetType === 'Question' ? api.comments.addQuestion : api.comments.addAnswer

  const refresh = useCallback(async () => {
    try {
      const result = await listComments(targetId)
      setComments(result.data)
      setError('')
    } catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }, [listComments, targetId])

  useEffect(() => { refresh() }, [refresh])

  async function submit(event) {
    event.preventDefault()
    try {
      const result = await addComment(targetId, content.trim())
      setComments(previous => [...previous, result.data])
      setContent(''); setError('')
    } catch (requestError) { setError(requestError.message) }
  }

  async function saveEdit(commentId) {
    try {
      const result = await api.comments.edit(commentId, editingContent.trim())
      setComments(previous => previous.map(comment => String(comment._id) === commentId ? result.data : comment))
      setEditingId(''); setEditingContent(''); setError('')
    } catch (requestError) { setError(requestError.message) }
  }

  async function deleteComment(commentId) {
    try {
      await api.comments.remove(commentId)
      setComments(previous => previous.filter(comment => String(comment._id) !== commentId))
      setError('')
    } catch (requestError) { setError(requestError.message) }
  }

  return <section aria-label={`${targetType.toLowerCase()} comments`} className="mt-5 border-t border-[var(--border)] pt-4">
    <h3 className="text-xs font-semibold text-[var(--muted)]">Comments{!loading && ` · ${comments.length}`}</h3>
    {comments.map(comment => {
      const id = String(comment._id)
      const authorId = String(comment.author?._id || comment.author?.id || '')
      return <article key={id} className="border-b border-[var(--border)] py-3 last:border-b-0">
        {editingId === id ? <div className="space-y-2"><textarea maxLength={1000} value={editingContent} onChange={event => setEditingContent(event.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--page)] p-2 text-sm" /><div className="flex gap-2"><button type="button" onClick={() => saveEdit(id)} className="text-xs font-semibold text-[var(--accent)]">Save</button><button type="button" onClick={() => setEditingId('')} className="text-xs text-[var(--muted)]">Cancel</button></div></div> : <><p className="whitespace-pre-wrap break-words text-sm leading-6">{comment.content}</p><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]"><span>{comment.author?.username || comment.author?.name || 'DevHub member'}</span><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>{authorId === currentUserId && <><button type="button" onClick={() => { setEditingId(id); setEditingContent(comment.content) }} className="text-[var(--accent)]">Edit</button><button type="button" onClick={() => deleteComment(id)} className="text-[var(--danger)]">Delete</button></>}</div></>}
      </article>
    })}
    {!loading && !comments.length && <p className="mt-2 text-xs text-[var(--muted)]">No comments yet.</p>}
    {error && <p role="alert" className="mt-2 text-xs text-[var(--danger)]">{error}</p>}
    {user ? <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor={`comment-${targetType}-${targetId}`}>Add a comment</label><input id={`comment-${targetType}-${targetId}`} required maxLength={1000} value={content} onChange={event => setContent(event.target.value)} placeholder="Add a comment…" className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-sm" /><button className="ui-button-secondary self-start">Comment</button></form> : <p className="mt-3 text-xs text-[var(--muted)]"><Link to="/login" className="text-[var(--accent)]">Log in</Link> to comment.</p>}
  </section>
}
