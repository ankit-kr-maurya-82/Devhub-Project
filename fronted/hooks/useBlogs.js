import { useSyncExternalStore } from 'react'
import { initialBlogs, markdownToText, readingTime } from '../data/blogs'

// Shared mock state. A full page reload restores the sample articles.
let blogs = initialBlogs
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return blogs
}

function update(next) {
  blogs = next
  listeners.forEach(listener => listener())
}

export function useBlogs() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function publishBlog({ title, tags, content }) {
  const id = `blog-${crypto.randomUUID()}`
  const article = content.trim()
  const plainText = markdownToText(article)
  const description = plainText.length > 180 ? `${plainText.slice(0, 177).trimEnd()}…` : plainText

  update([{
    id,
    title: title.trim(),
    tags: [...new Set(tags.map(tag => tag.trim()).filter(Boolean))],
    content: article,
    description,
    author: 'You',
    publishedAt: new Date().toISOString(),
    readingTime: readingTime(article),
    category: 'COMMUNITY',
    icon: 'book',
    accent: 'violet',
    featured: false,
    likes: 0,
    liked: false,
    comments: [],
  }, ...blogs])
  return id
}

export function toggleBlogLike(id) {
  update(blogs.map(blog => blog.id === id ? {
    ...blog,
    liked: !blog.liked,
    likes: blog.likes + (blog.liked ? -1 : 1),
  } : blog))
}

export function addBlogComment(id, body) {
  const comment = body.trim()
  if (!comment) return

  update(blogs.map(blog => blog.id === id ? {
    ...blog,
    comments: [...blog.comments, {
      id: crypto.randomUUID(),
      author: 'You',
      body: comment,
      publishedAt: new Date().toISOString(),
    }],
  } : blog))
}
