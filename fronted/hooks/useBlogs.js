import api from '../src/lib/api.js'
import { markdownToText, readingTime } from '../data/blogs.js'

export function mapBlog(blog) {
  return {
    ...blog,
    id: blog.slug,
    authorId: String(blog.author?._id || blog.author || ''),
    author: blog.author?.username || blog.author?.name || 'DevHub member',
    description: markdownToText(blog.content).slice(0, 220),
    readingTime: readingTime(blog.content),
    category: blog.tags?.[0] || 'Community',
    icon: 'code',
    accent: 'violet',
    tags: blog.tags || [],
  }
}

export const blogApi = api.blogs
