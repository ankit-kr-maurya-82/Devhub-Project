export const navigation = [
  { label: 'Home', to: '/', icon: 'home', group: 'Explore' },
  { label: 'Questions', to: '/questions', icon: 'message', group: 'Explore' },
  { label: 'Blogs', to: '/blogs', icon: 'book', group: 'Explore' },
  { label: 'Community', to: '/community', icon: 'users', group: 'Explore', requiresAuth: true },
  { label: 'My dashboard', to: '/dashboard', icon: 'grid', group: 'Your space', requiresAuth: true },
  { label: 'Notifications', to: '/notifications', icon: 'bell', group: 'Your space', requiresAuth: true },
  { label: 'My profile', to: '/profile', icon: 'user', group: 'Your space', requiresAuth: true },
  { label: 'Ask a question', to: '/ask-question', icon: 'plus', requiresAuth: true },
  { label: 'Admin workspace', to: '/admin', icon: 'shield', group: 'Admin tools', requiresAdmin: true },
]

export function navigationFor(user, role) {
  return navigation.filter(item => (!item.requiresAuth || user) && (!item.requiresAdmin || role === 'admin'))
}
