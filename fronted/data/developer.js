export const developer = {
  name: 'Alex Morgan',
  username: 'alex_codes',
  initials: 'AM',
  role: 'Full-stack developer',
  bio: 'Turning curiosity into useful things. I build with React and Node.js, share what I learn, and enjoy making complicated problems a little simpler.',
  location: null,
  github: null,
  joined: 'March 2025',
  skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Git', 'Tailwind CSS'],
}

export const developerStats = [
  { key: 'reputation', label: 'Reputation', value: 2840, icon: 'users', detail: 'Earned from the community', tone: 'violet' },
  { key: 'questions', label: 'Questions Asked', value: 24, icon: 'message', detail: 'Curiosity in action', tone: 'sky' },
  { key: 'answers', label: 'Answers Posted', value: 86, icon: 'message', detail: 'Helping others move forward', tone: 'emerald' },
  { key: 'blogs', label: 'Blogs Published', value: 12, icon: 'book', detail: 'Knowledge worth sharing', tone: 'amber' },
  { key: 'problems', label: 'Problems Solved', value: 128, icon: 'code', detail: 'One challenge at a time', tone: 'rose' },
]

export const topTags = [
  { name: 'React', count: 54 },
  { name: 'JavaScript', count: 42 },
  { name: 'Node.js', count: 28 },
  { name: 'TypeScript', count: 19 },
  { name: 'MongoDB', count: 14 },
]

export const achievements = [
  { id: 'first-question', name: 'Conversation starter', description: 'Asked your first question', icon: 'message', earned: 'Mar 2025' },
  { id: 'helping-hand', name: 'Helping hand', description: 'Shared 50 helpful answers', icon: 'users', earned: 'Jun 2025' },
  { id: 'published-author', name: 'Knowledge sharer', description: 'Published 10 technical blogs', icon: 'book', earned: 'Aug 2026' },
  { id: 'problem-solver', name: 'Problem solver', description: 'Solved 100 coding problems', icon: 'code', earned: 'Sep 2026' },
]

export const recentActivity = [
  { id: 'activity-1', kind: 'answer', icon: 'message', action: 'Posted an answer', title: 'Keeping React effects predictable', detail: 'Explained cleanup functions and stale requests.', date: '2026-09-20', reward: '+15 reputation' },
  { id: 'activity-2', kind: 'problem', icon: 'code', action: 'Solved a problem', title: 'Longest substring without repeating characters', detail: 'Practiced the sliding window pattern.', date: '2026-09-19' },
  { id: 'activity-3', kind: 'blog', icon: 'book', action: 'Published a blog', title: 'A practical guide to custom React hooks', detail: 'A new lesson for the community.', date: '2026-09-18', reward: '+25 reputation' },
  { id: 'activity-4', kind: 'achievement', icon: 'users', action: 'Earned an achievement', title: 'Problem solver', detail: 'Reached 100 solved coding problems.', date: '2026-09-17' },
  { id: 'activity-5', kind: 'question', icon: 'message', action: 'Asked a question', title: 'Where should shared state live in a React app?', detail: 'Started a discussion about component boundaries.', date: '2026-09-16' },
  { id: 'activity-6', kind: 'answer', icon: 'message', action: 'Posted an answer', title: 'Choosing indexes for a MongoDB query', detail: 'Shared a measurement-first approach.', date: '2026-09-15', reward: '+10 reputation' },
]

export const profileQuestions = [
  { id: 'shared-state', title: 'Where should shared state live in a React app?', excerpt: 'How do you decide when to lift state, use context, or introduce a dedicated state library?', tags: ['React', 'JavaScript'], votes: 18, answers: 4, date: '2026-09-16', resolved: true },
  { id: 'api-validation', title: 'How do you keep API validation consistent across routes?', excerpt: 'Looking for a maintainable approach to request validation in a growing Express application.', tags: ['Node.js', 'Express'], votes: 12, answers: 3, date: '2026-09-10', resolved: true },
  { id: 'typescript-generics', title: 'When is a generic type better than a union?', excerpt: 'I want a reusable TypeScript API without making the types harder to understand.', tags: ['TypeScript'], votes: 7, answers: 2, date: '2026-09-04', resolved: false },
]

export const profileAnswers = [
  { id: 'effect-cleanup', title: 'Keeping React effects predictable', excerpt: 'Treat each effect as a setup and cleanup pair. Cancel in-flight requests or ignore stale responses so an older request cannot overwrite newer state.', tags: ['React', 'JavaScript'], votes: 32, date: '2026-09-20', accepted: true },
  { id: 'mongo-indexes', title: 'Choosing indexes for a MongoDB query', excerpt: 'Start with the filter and sort your application actually uses. Compare explain plans against representative data before adding a compound index.', tags: ['MongoDB', 'Node.js'], votes: 21, date: '2026-09-15', accepted: true },
  { id: 'semantic-html', title: 'Making a custom tab component accessible', excerpt: 'Connect each tab to its panel, keep focus visible, and let arrow keys move between tabs. Native buttons give you a useful starting point.', tags: ['React', 'TypeScript'], votes: 14, date: '2026-09-08', accepted: false },
]

export const profileBlogs = [
  { id: 'custom-hooks', title: 'A practical guide to custom React hooks', excerpt: 'Give shared behavior a clear name, keep the API small, and make reusable hooks easier to reason about.', tags: ['React', 'TypeScript'], likes: 48, readingTime: '6 min read', date: '2026-09-18' },
  { id: 'express-structure', title: 'An Express project structure that grows with you', excerpt: 'Organize around features and keep HTTP concerns separate from application rules without adding unnecessary layers.', tags: ['Node.js', 'Express'], likes: 36, readingTime: '8 min read', date: '2026-09-07' },
]

// A fixed 12-week sample keeps both screens consistent across renders.
export const contributions = Array.from({ length: 84 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 5, 29 + index)).toISOString().slice(0, 10)
  const count = index % 9 === 0 || index % 7 === 6 ? 0 : (index * 7 + Math.floor(index / 7) * 3) % 6 + 1
  return { date, count }
})

export function formatDeveloperDate(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
