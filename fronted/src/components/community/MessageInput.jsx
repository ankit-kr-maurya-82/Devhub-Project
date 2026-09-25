import { useEffect, useId, useRef, useState } from 'react'
import Icon from '../../../components/Icon.jsx'

const emojis = ['👋', '😀', '🙌', '🚀', '🔥', '💜', '👍', '🎉', '💡', '🤔', '✅', '👀']
const toolbarButtonClass = 'flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400'

function ComposerIcon({ name }) {
  const paths = {
    emoji: 'M8 14s1.5 2 4 2 4-2 4-2 M8.5 8.5h.01 M15.5 8.5h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    attachment: 'm21 11-8.5 8.5a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8l8.3-8.3',
    send: 'm22 2-7 20-4-9-9-4 20-7Z M22 2 11 13',
  }
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>
}

export default function MessageInput({ conversationName, onSend }) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [attachmentNotice, setAttachmentNotice] = useState(false)
  const textareaRef = useRef(null)
  const emojiRef = useRef(null)
  const composerId = useId()
  const canSend = Boolean(text.trim() || code.trim())

  useEffect(() => {
    if (!showEmoji) return undefined
    const closePicker = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'pointerdown' && emojiRef.current?.contains(event.target)) return
      setShowEmoji(false)
    }
    document.addEventListener('pointerdown', closePicker)
    document.addEventListener('keydown', closePicker)
    return () => {
      document.removeEventListener('pointerdown', closePicker)
      document.removeEventListener('keydown', closePicker)
    }
  }, [showEmoji])

  const sendMessage = () => {
    if (!canSend) return
    const accepted = onSend({ text: text.trim(), ...(code.trim() ? { code: { language, content: code.trimEnd() } } : {}) })
    if (accepted !== true) return
    setText('')
    setCode('')
    setShowCode(false)
    setShowEmoji(false)
    setAttachmentNotice(false)
    textareaRef.current?.focus()
  }

  const insertEmoji = (emoji) => {
    const input = textareaRef.current
    const start = input?.selectionStart ?? text.length
    const end = input?.selectionEnd ?? text.length
    setText(`${text.slice(0, start)}${emoji}${text.slice(end)}`)
    setShowEmoji(false)
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); sendMessage() }} className="shrink-0 px-3 pb-3 pt-1 sm:px-5 sm:pb-4">
      <div className="rounded-xl border border-white/10 bg-[#17181e] transition focus-within:border-violet-400/40">
        {showCode && (
          <div className="m-2 overflow-hidden rounded-lg border border-white/10 bg-[#0c0d10]">
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
              <label className="flex items-center gap-2 text-[11px] text-zinc-400">
                <Icon name="code" className="size-3.5" />
                <span className="sr-only">Code language</span>
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded bg-[#0c0d10] py-1 text-zinc-300 focus-visible:outline-2 focus-visible:outline-violet-400">
                  {['javascript', 'typescript', 'jsx', 'python', 'java', 'html', 'css', 'json', 'bash', 'text'].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button type="button" aria-label="Remove code snippet" onClick={() => { setCode(''); setShowCode(false) }} className={toolbarButtonClass}><Icon name="close" className="size-3.5" /></button>
            </div>
            <label htmlFor={`${composerId}-code`} className="sr-only">Code snippet</label>
            <textarea id={`${composerId}-code`} value={code} onChange={(event) => setCode(event.target.value)} rows={4} spellCheck={false} placeholder={'const hello = () => {\n  console.log("Hello DevHub");\n};'} className="block max-h-40 min-h-20 w-full resize-y bg-transparent px-3 py-2 font-mono text-xs leading-5 text-violet-200 outline-none placeholder:text-zinc-600" />
          </div>
        )}
        <label htmlFor={`${composerId}-message`} className="sr-only">Message {conversationName}</label>
        <textarea ref={textareaRef} id={`${composerId}-message`} value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) {
            event.preventDefault()
            sendMessage()
          }
        }} rows={2} placeholder={`Message ${conversationName}`} aria-describedby={`${composerId}-hint`} className="block max-h-40 min-h-20 w-full resize-y bg-transparent px-4 pb-1 pt-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600" />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex items-center gap-0.5">
            <div ref={emojiRef} className="relative">
              <button type="button" aria-label="Choose an emoji" aria-expanded={showEmoji} aria-controls={`${composerId}-emojis`} onClick={() => setShowEmoji((visible) => !visible)} className={toolbarButtonClass}><ComposerIcon name="emoji" /></button>
              {showEmoji && <div id={`${composerId}-emojis`} role="group" aria-label="Emoji picker" className="absolute bottom-11 left-0 z-20 grid w-56 grid-cols-6 gap-1 rounded-xl border border-white/10 bg-[#202128] p-2 shadow-xl">
                {emojis.map((emoji) => <button key={emoji} type="button" aria-label={`Insert ${emoji}`} onClick={() => insertEmoji(emoji)} className="flex size-8 items-center justify-center rounded-lg text-lg hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-violet-400">{emoji}</button>)}
              </div>}
            </div>
            <button type="button" aria-label="File attachments unavailable in this demo" title="File attachments unavailable in this demo" onClick={() => setAttachmentNotice((visible) => !visible)} className={toolbarButtonClass}><ComposerIcon name="attachment" /></button>
            <button type="button" aria-label="Add code snippet" aria-expanded={showCode} onClick={() => setShowCode(true)} className={`${toolbarButtonClass} ${showCode ? 'bg-violet-500/10 text-violet-300' : ''}`}><Icon name="code" className="size-4" /></button>
          </div>
          <button type="submit" disabled={!canSend} className="flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:cursor-not-allowed disabled:bg-violet-500/20 disabled:text-violet-300/40 sm:px-4">
            Send <ComposerIcon name="send" />
          </button>
        </div>
      </div>
      {attachmentNotice && <p role="status" className="mt-2 text-[11px] text-amber-300/80">File attachments will be available in a future phase.</p>}
      <p id={`${composerId}-hint`} className="mt-2 text-[10px] text-zinc-600"><span className="font-medium text-zinc-500">Enter</span> to send <span aria-hidden="true">·</span> <span className="font-medium text-zinc-500">Shift + Enter</span> for a new line</p>
    </form>
  )
}
