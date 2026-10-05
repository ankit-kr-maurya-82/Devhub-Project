import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import CommunitySidebar from '../components/community/CommunitySidebar.jsx'
import ChatHeader from '../components/community/ChatHeader.jsx'
import MessageList from '../components/community/MessageList.jsx'
import MessageInput from '../components/community/MessageInput.jsx'
import OnlineMembers from '../components/community/OnlineMembers.jsx'
import { communityChannels, communityMembers, createInitialConversations, currentUserId, directContacts } from '../data/community.js'

function CommunityDrawer({ kind, title, onClose, children }) {
  const dialog = useRef(null)

  useEffect(() => {
    const node = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    node.showModal()
    document.body.style.overflow = 'hidden'
    const breakpoint = window.matchMedia('(min-width: 768px)')
    const closeOnResize = () => {
      if (kind === 'channels' && breakpoint.matches) node.close()
    }
    breakpoint.addEventListener('change', closeOnResize)
    return () => {
      breakpoint.removeEventListener('change', closeOnResize)
      node.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [kind])

  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close()
  }

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onClose={event => { if (!event.currentTarget.open) onClose() }}
      onClick={closeOnBackdrop}
      className={`fixed inset-y-0 m-0 h-dvh max-h-dvh w-80 max-w-[90vw] overflow-y-auto border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text)] shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm ${kind === 'channels' ? 'left-0 right-auto border-r' : 'left-auto right-0 border-l'}`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button type="button" autoFocus onClick={() => dialog.current.close()} aria-label={`Close ${title.toLowerCase()}`} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]"><Icon name="close" /></button>
      </div>
      {children}
    </dialog>
  )
}

export default function Community() {
  const [channels, setChannels] = useState(communityChannels)
  const [contacts, setContacts] = useState(directContacts)
  const [activeConversation, setActiveConversation] = useState({ type: 'channel', id: 'javascript' })
  const [conversations, setConversations] = useState(createInitialConversations)
  const [drawer, setDrawer] = useState(null)
  const messageSequence = useRef(0)
  const conversationKey = `${activeConversation.type}:${activeConversation.id}`
  const channel = activeConversation.type === 'channel' ? channels.find(item => item.id === activeConversation.id) : null
  const member = activeConversation.type === 'dm' ? communityMembers.find(item => item.id === activeConversation.id) : null
  const currentUser = communityMembers.find(item => item.id === currentUserId)
  const conversationName = channel ? `#${channel.name}` : member.name
  const messages = conversations[conversationKey] || []

  function selectChannel(id) {
    setActiveConversation({ type: 'channel', id })
    setChannels(previous => previous.map(item => item.id === id ? { ...item, unreadCount: 0 } : item))
    setDrawer(null)
  }

  function selectDirectMessage(id) {
    setActiveConversation({ type: 'dm', id })
    setContacts(previous => previous.map(item => item.memberId === id ? { ...item, unreadCount: 0 } : item))
    setDrawer(null)
  }

  function sendMessage({ text = '', code }) {
    const cleanText = text.trim()
    const snippet = code?.content.trim() ? { language: code.language || 'text', content: code.content } : undefined
    if (!cleanText && !snippet) return false
    const message = { id: `local-${Date.now()}-${messageSequence.current++}`, authorId: currentUserId, text: cleanText, code: snippet, createdAt: new Date().toISOString(), reactions: [] }
    setConversations(previous => ({ ...previous, [conversationKey]: [...(previous[conversationKey] || []), message] }))
    if (member) setContacts(previous => previous.map(item => item.memberId === member.id ? { ...item, preview: cleanText || 'Shared a code snippet' } : item))
    return true
  }

  function toggleReaction(messageId, emoji) {
    setConversations(previous => ({
      ...previous,
      [conversationKey]: previous[conversationKey].map(message => {
        if (message.id !== messageId) return message
        const existing = message.reactions.find(reaction => reaction.emoji === emoji)
        const reactions = existing
          ? message.reactions.map(reaction => reaction.emoji === emoji ? { ...reaction, reacted: !reaction.reacted, count: reaction.count + (reaction.reacted ? -1 : 1) } : reaction).filter(reaction => reaction.count > 0)
          : [...message.reactions, { emoji, count: 1, reacted: true }]
        return { ...message, reactions }
      }),
    }))
  }

  const sidebar = <CommunitySidebar channels={channels} contacts={contacts} members={communityMembers} activeConversation={activeConversation} onSelectChannel={selectChannel} onSelectDirectMessage={selectDirectMessage} currentUser={currentUser} />

  return (
    <section aria-label="DevHub Community chat" className="mx-auto flex h-[calc(100dvh-7.5rem)] min-h-[38rem] max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="shrink-0 border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-[var(--text)]">Community</h1>
          <span className="rounded-full bg-[var(--surface-raised)] px-2.5 py-1 text-xs text-[var(--muted)]">Preview</span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">Sample conversations. Messages stay on this page and reset on refresh.</p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label="Community channels and direct messages" className="hidden min-h-0 overflow-y-auto border-r border-[var(--border)] md:block">{sidebar}</aside>
        <div className="flex min-h-0 min-w-0 flex-col bg-[var(--surface)]">
          <ChatHeader channel={channel} member={member} onOpenChannels={() => setDrawer('channels')} onOpenMembers={() => setDrawer('members')} />
          <MessageList key={conversationKey} messages={messages} members={communityMembers} currentUserId={currentUserId} onReact={toggleReaction} conversationName={conversationName} />
          <div className="min-w-0 shrink-0 border-t border-[var(--border)] bg-[var(--surface)] pt-3">
            <MessageInput key={conversationKey} conversationName={conversationName} onSend={sendMessage} />
          </div>
        </div>
      </div>
      {drawer && <CommunityDrawer key={drawer} kind={drawer} title={drawer === 'channels' ? 'Community channels' : 'Community members'} onClose={() => setDrawer(null)}>{drawer === 'channels' ? sidebar : <OnlineMembers members={communityMembers} />}</CommunityDrawer>}
    </section>
  )
}
