import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import CommunitySidebar from '../components/community/CommunitySidebar.jsx'
import ChatHeader from '../components/community/ChatHeader.jsx'
import MessageList from '../components/community/MessageList.jsx'
import MessageInput from '../components/community/MessageInput.jsx'
import OnlineMembers from '../components/community/OnlineMembers.jsx'
import api from '../lib/api.js'
import { useMockSession } from '../state/useMockSession.js'

function initials(member) {
  return (member?.name || member?.username || '?').slice(0, 1).toUpperCase()
}

function normalizeMember(member) {
  const id = String(member?._id || member?.id || '')
  return { id, memberId: id, name: member?.name || member?.username || 'Community member', initials: initials(member), online: Boolean(member?.isOnline), reputation: member?.reputation || 0 }
}

function normalizeMessage(message, currentUserId) {
  const senderId = String(message.sender?._id || message.sender || '')
  const counts = new Map()
  for (const reaction of message.reactions || []) {
    const prior = counts.get(reaction.emoji) || { emoji: reaction.emoji, count: 0, reacted: false }
    prior.count += 1
    prior.reacted ||= String(reaction.user?._id || reaction.user) === currentUserId
    counts.set(reaction.emoji, prior)
  }
  return {
    id: String(message._id || message.id),
    authorId: senderId,
    text: message.isDeleted ? 'This message was deleted' : message.content,
    createdAt: message.createdAt,
    reactions: [...counts.values()],
  }
}

function CommunityDrawer({ title, onClose, children }) {
  const dialog = useRef(null)
  useEffect(() => {
    const node = dialog.current
    const previousFocus = document.activeElement
    node.showModal()
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('keydown', closeOnEscape); node.close(); if (previousFocus?.isConnected) previousFocus.focus() }
  }, [onClose])
  return <dialog ref={dialog} aria-label={title} onClick={event => { if (event.target === event.currentTarget) onClose() }} className="fixed inset-y-0 right-0 m-0 h-dvh max-h-dvh w-80 max-w-[90vw] overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text)] shadow-2xl backdrop:bg-black/70"><div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4"><h2 className="text-sm font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Close members" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)]"><Icon name="close" /></button></div>{children}</dialog>
}

export default function Community() {
  const { user } = useMockSession()
  const currentUserId = String(user?.id || user?._id || '')
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [drawer, setDrawer] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('Loading rooms…')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')

  const fetchMessages = useCallback(async roomId => {
    const result = await api.rooms.messages(roomId)
    setMessages(result.data.map(message => normalizeMessage(message, currentUserId)))
  }, [currentUserId])

  const openRoom = useCallback(async room => {
    if (!user) { setError('Log in to join rooms and read messages.'); return }
    setError('')
    setLoadingMessages(true)
    try {
      const result = await api.rooms.get(room.id)
      let fullRoom = result.data
      const roomMembers = fullRoom.members || []
      const isMember = roomMembers.some(member => String(member?._id || member) === currentUserId)
      if (!isMember) {
        const joined = await api.rooms.join(room.id)
        fullRoom = joined.data
      }
      setActiveRoom({ ...room, ...fullRoom, id: String(fullRoom._id || fullRoom.id), memberCount: fullRoom.members?.length || room.memberCount || 0 })
      setMembers((fullRoom.members || []).map(normalizeMember))
      await fetchMessages(room.id)
      setConnectionStatus('Room connected · messages refresh every 4 seconds')
    } catch (requestError) {
      setError(requestError.message)
      setConnectionStatus('Room unavailable')
    } finally {
      setLoadingMessages(false)
      setDrawer(false)
    }
  }, [fetchMessages, currentUserId, user])

  useEffect(() => {
    let active = true
    api.rooms.list({ limit: '50' })
      .then(result => {
        if (!active) return
        const nextRooms = result.data.map(room => ({ id: String(room._id), name: room.name, description: room.description || '', memberCount: room.members?.length || 0, members: room.members || [] }))
        setRooms(nextRooms)
        setConnectionStatus(nextRooms.length ? 'Choose a public room' : 'No public rooms yet')
        if (nextRooms.length && user) void openRoom(nextRooms[0])
      })
      .catch(requestError => { if (active) { setError(requestError.message); setConnectionStatus('Unable to load rooms') } })
      .finally(() => { if (active) setLoadingRooms(false) })
    return () => { active = false }
  }, [openRoom, user])

  useEffect(() => {
    if (!activeRoom || !user) return undefined
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') fetchMessages(activeRoom.id).catch(() => {})
    }, 4000)
    return () => window.clearInterval(timer)
  }, [activeRoom, fetchMessages, user])

  async function sendMessage({ text = '', code }) {
    const cleanText = text.trim()
    const content = [cleanText, code?.content.trim() ? `\n\n\`\`\`${code.language || 'text'}\n${code.content.trimEnd()}\n\`\`\`` : ''].filter(Boolean).join('')
    if (!content || !activeRoom) return false
    try {
      await api.rooms.sendMessage(activeRoom.id, { content })
      await fetchMessages(activeRoom.id)
      setError('')
    } catch (requestError) { setError(requestError.message) }
    return true
  }

  async function toggleReaction(messageId, emoji) {
    try {
      await api.messages.react(messageId, emoji)
      await fetchMessages(activeRoom.id)
      setError('')
    } catch (requestError) { setError(requestError.message) }
  }

  async function createRoom(event) {
    event.preventDefault()
    setError('')
    try {
      const result = await api.rooms.create({ name: roomName.trim(), description: roomDescription.trim(), category: 'general', isPublic: true })
      const created = result.data
      const room = { id: String(created._id), name: created.name, description: created.description || '', members: created.members || [currentUserId], memberCount: created.members?.length || 1 }
      setRooms(previous => [room, ...previous.filter(item => item.id !== room.id)])
      setRoomName(''); setRoomDescription(''); setShowCreateRoom(false)
      await openRoom(room)
    } catch (requestError) { setError(requestError.message) }
  }

  const selectRoom = roomId => {
    const room = rooms.find(item => item.id === roomId)
    if (room) void openRoom(room)
  }
  const currentUser = user ? normalizeMember({ ...user, _id: currentUserId }) : null
  const sidebar = <CommunitySidebar channels={rooms.map(room => ({ ...room, unreadCount: 0 }))} contacts={[]} members={members} activeConversation={{ type: 'channel', id: activeRoom?.id }} onSelectChannel={selectRoom} onSelectDirectMessage={() => {}} currentUser={currentUser} />

  if (!user) return <section className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"><h1>Join the community</h1><p className="text-sm leading-6 text-[var(--muted)]">Sign in to join public rooms, read room history, and send messages.</p><div className="flex gap-3"><Link to="/login" className="ui-button">Log in</Link><Link to="/register" className="ui-button-secondary">Create account</Link></div></section>

  const conversationName = activeRoom ? `#${activeRoom.name}` : 'a room'
  return (
    <section aria-label="DevHub Community chat" className="mx-auto flex h-[calc(100dvh-7.5rem)] min-h-[38rem] max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="shrink-0 border-b border-[var(--border)] px-4 py-4 sm:px-6"><div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-[var(--text)]">Community</h1><span className="rounded-full bg-[var(--surface-raised)] px-2.5 py-1 text-xs text-[var(--muted)]">Backend connected</span><button type="button" onClick={() => setShowCreateRoom(open => !open)} className="ui-button-secondary ml-auto">{showCreateRoom ? 'Cancel' : 'Create room'}</button></div><p className="mt-1 text-sm text-[var(--muted)]">{connectionStatus}</p>{showCreateRoom && <form onSubmit={createRoom} className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]"><input required minLength={3} maxLength={100} value={roomName} onChange={event => setRoomName(event.target.value)} aria-label="Room name" placeholder="Room name" className="rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-sm" /><input maxLength={500} value={roomDescription} onChange={event => setRoomDescription(event.target.value)} aria-label="Room description" placeholder="Description (optional)" className="rounded-lg border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-sm" /><button className="ui-button">Create public room</button></form>}</div>
      {error && <p role="alert" className="border-b border-[var(--border)] px-5 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label="Community rooms" className="hidden min-h-0 overflow-y-auto border-r border-[var(--border)] md:block">{sidebar}</aside>
        <div className="flex min-h-0 min-w-0 flex-col bg-[var(--surface)]">
          <ChatHeader channel={activeRoom} onOpenChannels={() => setDrawer('channels')} onOpenMembers={() => setDrawer('members')} />
          {loadingRooms || loadingMessages ? <p role="status" className="m-auto p-6 text-sm text-[var(--muted)]">{loadingRooms ? 'Loading public rooms…' : 'Loading room messages…'}</p> : activeRoom ? <MessageList key={activeRoom.id} messages={messages} members={members} currentUserId={currentUserId} onReact={toggleReaction} conversationName={conversationName} /> : <p className="m-auto p-6 text-sm text-[var(--muted)]">Select a room to begin.</p>}
          <div className="min-w-0 shrink-0 border-t border-[var(--border)] bg-[var(--surface)] pt-3">{activeRoom && <MessageInput key={activeRoom.id} conversationName={conversationName} onSend={sendMessage} />}</div>
        </div>
      </div>
      {drawer === 'channels' && <CommunityDrawer title="Community rooms" onClose={() => setDrawer(false)}>{sidebar}</CommunityDrawer>}
      {drawer === 'members' && <CommunityDrawer title="Room members" onClose={() => setDrawer(false)}><OnlineMembers members={members} /></CommunityDrawer>}
    </section>
  )
}
