const headingPattern = /^(#{2,3})\s+(.+)$/
const unorderedPattern = /^[-*]\s+(.+)$/
const orderedPattern = /^\d+[.)]\s+(.+)$/
const quotePattern = /^>\s?(.*)$/
const fencePattern = /^```(.*)$/

function inlineContent(text) {
  return text.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-zinc-100">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-violet-400/10 px-1.5 py-0.5 font-mono text-[0.9em] text-violet-200">{part.slice(1, -1)}</code>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

function isBlockStart(line) {
  const trimmed = line.trim()
  return headingPattern.test(trimmed) || fencePattern.test(trimmed)
    || unorderedPattern.test(trimmed) || orderedPattern.test(trimmed)
    || quotePattern.test(trimmed)
}

function parseBlocks(content) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let cursor = 0

  while (cursor < lines.length) {
    const line = lines[cursor].trim()
    if (!line) {
      cursor += 1
      continue
    }

    const fence = line.match(fencePattern)
    if (fence) {
      const code = []
      cursor += 1
      while (cursor < lines.length && !/^```\s*$/.test(lines[cursor].trim())) {
        code.push(lines[cursor])
        cursor += 1
      }
      if (cursor < lines.length) cursor += 1
      blocks.push({ type: 'code', language: fence[1].trim(), text: code.join('\n') })
      continue
    }

    const heading = line.match(headingPattern)
    if (heading) {
      blocks.push({ type: heading[1] === '##' ? 'h2' : 'h3', text: heading[2] })
      cursor += 1
      continue
    }

    if (quotePattern.test(line)) {
      const quote = []
      while (cursor < lines.length && quotePattern.test(lines[cursor].trim())) {
        quote.push(lines[cursor].trim().replace(quotePattern, '$1'))
        cursor += 1
      }
      blocks.push({ type: 'quote', text: quote.join('\n') })
      continue
    }

    const listPattern = orderedPattern.test(line) ? orderedPattern : unorderedPattern
    if (listPattern.test(line)) {
      const items = []
      const ordered = listPattern === orderedPattern
      const start = ordered ? Number.parseInt(line, 10) : undefined
      while (cursor < lines.length && listPattern.test(lines[cursor].trim())) {
        items.push(lines[cursor].trim().replace(listPattern, '$1'))
        cursor += 1
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items, start })
      continue
    }

    const paragraph = [lines[cursor]]
    cursor += 1
    while (cursor < lines.length && lines[cursor].trim() && !isBlockStart(lines[cursor])) {
      paragraph.push(lines[cursor])
      cursor += 1
    }
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
  }

  return blocks
}

export default function BlogContent({ content = '' }) {
  return (
    <div className="min-w-0 space-y-5 break-words text-[15px] leading-8 text-zinc-300">
      {parseBlocks(content).map((block, index) => {
        switch (block.type) {
          case 'h2':
            return <h2 key={index} className="pt-4 text-2xl font-semibold leading-snug tracking-tight text-zinc-100">{inlineContent(block.text)}</h2>
          case 'h3':
            return <h3 key={index} className="pt-2 text-lg font-semibold leading-snug text-zinc-100">{inlineContent(block.text)}</h3>
          case 'code':
            return (
              <div key={index} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/70">
                {block.language && <div className="border-b border-white/5 px-4 py-1.5 font-mono text-xs text-zinc-500">{block.language}</div>}
                <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-zinc-200"><code>{block.text}</code></pre>
              </div>
            )
          case 'quote':
            return <blockquote key={index} className="whitespace-pre-line rounded-r-lg border-l-2 border-violet-400 bg-violet-400/5 py-2 pl-5 pr-4 italic text-zinc-400">{inlineContent(block.text)}</blockquote>
          case 'ol':
            return <ol key={index} start={block.start} className="list-decimal space-y-2 pl-6 marker:text-violet-300">{block.items.map((item, itemIndex) => <li key={itemIndex} className="pl-1">{inlineContent(item)}</li>)}</ol>
          case 'ul':
            return <ul key={index} className="list-disc space-y-2 pl-6 marker:text-violet-300">{block.items.map((item, itemIndex) => <li key={itemIndex} className="pl-1">{inlineContent(item)}</li>)}</ul>
          default:
            return <p key={index} className="whitespace-pre-line">{inlineContent(block.text)}</p>
        }
      })}
    </div>
  )
}
