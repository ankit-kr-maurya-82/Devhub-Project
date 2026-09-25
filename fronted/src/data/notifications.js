const now = Date.now()
const minutesAgo = (minutes) => new Date(now - minutes * 60_000).toISOString()

export const initialNotifications = [
  {
    id: 'notification-answer',
    type: 'answer',
    icon: 'message',
    title: 'A new answer to your question',
    message: 'Priya answered your question about sharing state between React components.',
    timestamp: minutesAgo(4),
    read: false,
    target: '/questions',
  },
  {
    id: 'notification-upvote',
    type: 'upvote',
    icon: 'heart',
    title: 'Your answer is helping others',
    message: 'Rahul upvoted your answer about JavaScript promises. Keep sharing what you know!',
    timestamp: minutesAgo(18),
    read: false,
    target: '/questions',
  },
  {
    id: 'notification-comment',
    type: 'blog-comment',
    icon: 'book',
    title: 'A new comment on your blog',
    message: 'Aman commented on your blog: “This explanation of async/await really helped.”',
    timestamp: minutesAgo(42),
    read: false,
    target: '/blogs',
  },
  {
    id: 'notification-mention',
    type: 'community-mention',
    icon: 'hash',
    title: 'You were mentioned in #javascript',
    message: 'Priya mentioned you in the community: “@Ankit, what do you think of this approach?”',
    timestamp: minutesAgo(95),
    read: false,
    target: '/community',
  },
  {
    id: 'notification-dm',
    type: 'direct-message',
    icon: 'message',
    title: 'A direct message from Rahul',
    message: 'Rahul sent you a message: “Want to work through the next DSA challenge together?”',
    timestamp: minutesAgo(180),
    read: false,
    target: '/community',
  },
  {
    id: 'notification-achievement',
    type: 'achievement',
    icon: 'shield',
    title: 'Achievement unlocked: Helping Hand',
    message: 'You have helped fellow developers with 10 answers. Your community appreciates you.',
    timestamp: minutesAgo(1_440),
    read: true,
    target: '/profile',
  },
  {
    id: 'notification-announcement',
    type: 'admin-announcement',
    icon: 'users',
    title: 'Welcome to the DevHub community',
    message: 'From the DevHub team: explore the channels, introduce yourself, and build something together.',
    timestamp: minutesAgo(2_880),
    read: true,
    target: '/community',
  },
]

export function formatNotificationTime(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
}
