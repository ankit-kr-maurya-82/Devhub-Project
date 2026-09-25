import { useSyncExternalStore } from 'react'
import { initialBlogs, readingTime } from '../data/blogs'

// Shared mock state. A full page reload restores the sample articles.
let blogs = initialBlogs.map(blog => ({ ...blog, readingTime: readingTime(blog.content) }))
const listeners = new Set()
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
const getSnapshot = () => blogs
const update = next => { blogs = next; listeners.forEach(listener => listener()) }

export function useBlogs() { return useSyncExternalStore(subscribe, getSnapshot) }
export function publishBlog({ title, tags, content }) {
  const id = `blog-${crypto.randomUUID()}`
  update([{ id, title: title.trim(), tags, content: content.trim(), description: content.trim().replace(/^## /gm, '').slice(0, 180), author: 'You', publishedAt: new Date().toISOString(), readingTime: readingTime(content), category: 'COMMUNITY', icon: 'book', accent: 'violet', featured: false, likes: 0, liked: false, comments: [] }, ...blogs])
  return id
}
export function toggleBlogLike(id) {
  update(blogs.map(blog => blog.id === id ? { ...blog, liked: !blog.liked, likes: blog.likes + (blog.liked ? -1 : 1) } : blog))
}
export function addBlogComment(id, body) {
  if (!body.trim()) return
  update(blogs.map(blog => blog.id === id ? { ...blog, comments: [...blog.comments, { id: crypto.randomUUID(), author: 'You', body: body.trim(), publishedAt: new Date().toISOString() }] } : blog))
}
