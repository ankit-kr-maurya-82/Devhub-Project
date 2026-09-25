export default function BlogContent({ content }) {
  return <div className="space-y-5 break-words text-sm leading-8 text-zinc-300">{content.split(/\n\s*\n/).filter(Boolean).map((block, index) => block.startsWith('## ') ? <h2 key={index} className="pt-3 text-xl font-semibold text-zinc-100">{block.slice(3)}</h2> : <p key={index} className="whitespace-pre-wrap">{block}</p>)}</div>
}
