// Blog records must come from a persistent API; no seed articles are bundled.
export const initialBlogs = []

export function markdownToText(content = '') {
  return content
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*```[^\n]*$/gm, '')
    .replace(/^\s*#{2,3}\s+/gm, '')
    .replace(/^\s*(?:[-*]|\d+[.)])\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function readingTime(content) {
  const words = markdownToText(content).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export function formatBlogDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
