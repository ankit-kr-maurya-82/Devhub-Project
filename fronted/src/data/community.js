export const currentUserId = 'ankit'

export const communityMembers = [
  { id: 'ankit', name: 'Ankit', initials: 'AK', reputation: 4820, online: true, avatarClass: 'bg-violet-500/20 text-violet-200' },
  { id: 'rahul', name: 'Rahul', initials: 'RS', reputation: 3640, online: true, avatarClass: 'bg-sky-500/20 text-sky-200' },
  { id: 'priya', name: 'Priya', initials: 'PS', reputation: 7150, online: true, avatarClass: 'bg-rose-500/20 text-rose-200' },
  { id: 'aman', name: 'Aman', initials: 'AM', reputation: 2180, online: false, avatarClass: 'bg-amber-500/20 text-amber-200' },
]

export const communityChannels = [
  { id: 'general', name: 'general', description: 'Meet the community, share your wins, and talk about what you are building.', memberCount: 2480, onlineCount: 168, unreadCount: 3 },
  { id: 'javascript', name: 'javascript', description: 'Discuss JavaScript, Node.js and frontend development', memberCount: 1240, onlineCount: 84, unreadCount: 0 },
  { id: 'react', name: 'react', description: 'Components, hooks, and everything in the React ecosystem.', memberCount: 986, onlineCount: 62, unreadCount: 5 },
  { id: 'nodejs', name: 'nodejs', description: 'Build better APIs and explore backend development with Node.js.', memberCount: 742, onlineCount: 41, unreadCount: 2 },
  { id: 'python', name: 'python', description: 'Talk Python, automation, data science, and your next side project.', memberCount: 864, onlineCount: 53, unreadCount: 0 },
  { id: 'java', name: 'java', description: 'Explore Java, the JVM, and reliable application design.', memberCount: 528, onlineCount: 29, unreadCount: 0 },
  { id: 'dsa', name: 'dsa', description: 'Work through data structures and algorithms together.', memberCount: 1120, onlineCount: 76, unreadCount: 8 },
  { id: 'web-development', name: 'web-development', description: 'From your first website to shipping for the web.', memberCount: 1560, onlineCount: 97, unreadCount: 0 },
]

export const directContacts = [
  { memberId: 'rahul', unreadCount: 2, preview: 'Want to pair on that project?' },
  { memberId: 'priya', unreadCount: 0, preview: 'Happy to take a look!' },
  { memberId: 'aman', unreadCount: 0, preview: 'Catch you tomorrow.' },
]

// Keep the demo timestamps relative to opening the page.
export function createInitialConversations() {
  const now = Date.now()
  const ago = minutes => new Date(now - minutes * 60000).toISOString()
  const conversations = Object.fromEntries(communityChannels.map((channel, index) => [
    `channel:${channel.id}`,
    [{ id: `${channel.id}-welcome`, authorId: index % 2 === 0 ? 'priya' : 'rahul', text: `Welcome to #${channel.name}! ${channel.description} What are you working on today?`, createdAt: ago(50), reactions: [{ emoji: '👋', count: 4, reacted: false }] }],
  ]))

  conversations['channel:javascript'] = [
    { id: 'js-1', authorId: 'ankit', text: 'Hey everyone! 👋 I’m working on a small developer community app. What’s one JavaScript concept that clicked for you recently?', createdAt: ago(24), reactions: [{ emoji: '👋', count: 6, reacted: false }, { emoji: '🚀', count: 3, reacted: false }] },
    { id: 'js-2', authorId: 'rahul', text: 'Closures! Thinking of a function as carrying its own little backpack of variables finally made it stick.', createdAt: ago(21), reactions: [{ emoji: '💡', count: 8, reacted: false }] },
    { id: 'js-3', authorId: 'priya', text: 'Love that explanation. Also, a tiny hello to everyone shipping something today ✨', code: { language: 'javascript', content: 'const hello = () => {\n  console.log("Hello DevHub");\n};' }, createdAt: ago(18), reactions: [{ emoji: '❤️', count: 5, reacted: false }, { emoji: '🚀', count: 4, reacted: false }] },
    { id: 'js-4', authorId: 'aman', text: 'I finally got comfortable with async/await this week. Reading the code from top to bottom makes debugging so much easier.', createdAt: ago(12), reactions: [{ emoji: '🎉', count: 3, reacted: false }] },
    { id: 'js-5', authorId: 'priya', text: 'Those small moments of understanding add up. Drop your questions here — we can work through them together.', createdAt: ago(7), reactions: [{ emoji: '👍', count: 4, reacted: false }] },
  ]

  directContacts.forEach((contact, index) => {
    conversations[`dm:${contact.memberId}`] = [{ id: `dm-${contact.memberId}-1`, authorId: contact.memberId, text: contact.preview, createdAt: ago(15 + index * 10), reactions: [] }]
  })
  return conversations
}
