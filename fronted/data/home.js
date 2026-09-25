export const questions = [
  { 
    id: 'react-rendering', 
    title: 'Why does my React component render twice in development?', 
    description: 'I noticed my useEffect runs twice when the app first loads. Is this expected with StrictMode, and how should I handle API calls?', 
    tags: ['React', 'JavaScript'], 
    votes: 128, 
    answers: 16, 
    views: '2.4k', 
    username: 'sarah.codes', 
    time: '2 hours ago' 
  },
  { 
    id: 'node-structure', 
    title: 'How do you structure a Node.js API as your project grows?', 
    description: 'Moving beyond a single routes file. Looking for practical ways to organize controllers, services, and validation in a MERN app.', 
    tags: ['Node.js', 'MERN', 'MongoDB'], 
    votes: 96, 
    answers: 12, 
    views: '1.8k', 
    username: 'alex_dev', 
    time: '4 hours ago' 
  },
  { 
    id: 'sliding-window', 
    title: 'When should I use a sliding window instead of two pointers?', description: 'Both patterns seem similar when solving array problems. What clues help you choose the right approach in an interview?', tags: ['DSA', 'Java', 'Python'], votes: 74, answers: 9, views: '1.2k', username: 'priya.builds', time: '6 hours ago' },
]

export const blogs = [
  { id: 'react-patterns', 
    title: 'React patterns that make your components easier to maintain', 
    author: 'Emma Wilson', 
    description: 'A practical guide to composition, custom hooks, and keeping your component API simple.', 
    tags: ['React', 'JavaScript'], 
    readingTime: '8 min read', 
    category: 'FRONTEND', 
    icon: 'code', 
    accent: 'violet' 
  },
  { id: 'mongodb-indexes', 
    title: 'A developer’s guide to faster MongoDB queries', 
    author: 'Marcus Chen', 
    description: 'Understand indexes, read query plans, and avoid the performance traps that slow down your API.', 
    tags: ['MongoDB', 'Node.js', 'MERN'], 
    readingTime: '6 min read', 
    category: 'BACKEND', 
    icon: 'grid', 
    accent: 'emerald' },
  { id: 'problem-solving', 
    title: 'Build a better problem-solving habit, one day at a time', 
    author: 'Aisha Patel', 
    description: 'A thoughtful approach to practicing algorithms without getting stuck in an endless tutorial loop.', 
    tags: ['DSA', 'Python'], 
    readingTime: '5 min read', 
    category: 'CAREER & GROWTH', 
    icon: 'book', 
    accent: 'amber' },
]

export const popularTags = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Java', 'Python', 'DSA', 'MERN']
export const communityStats = [
  { label: 'Developers', value: '12.8k', icon: 'users' },
  { label: 'Questions', value: '8.4k', icon: 'message' },
  { label: 'Answers', value: '24.6k', icon: 'code' },
  { label: 'Blogs', value: '1.2k', icon: 'book' },
]
