// Blog data is unavailable until a persistent backend API is connected.
export function useBlogs() { return [] }
export async function publishBlog() { throw new Error('Blog publishing is not available yet.') }
export async function addBlogComment() { throw new Error('Blog comments are not available yet.') }
export async function toggleBlogLike() { throw new Error('Blog likes are not available yet.') }
