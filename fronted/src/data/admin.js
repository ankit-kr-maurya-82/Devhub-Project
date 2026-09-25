// All records are fictional and only exist in this frontend preview.
export function createAdminData() {
  const daysAgo = days => new Date(Date.now() - days * 86400000).toISOString()
  const users = [
    { id: 'u-1', name: 'Ankit Sharma', username: 'ankit', email: 'ankit@devhub.example', initials: 'AS', reputation: 4820, joinedAt: daysAgo(120), status: 'active' },
    { id: 'u-2', name: 'Rahul Singh', username: 'rahul', email: 'rahul@devhub.example', initials: 'RS', reputation: 3640, joinedAt: daysAgo(84), status: 'active' },
    { id: 'u-3', name: 'Priya Patel', username: 'priya', email: 'priya@devhub.example', initials: 'PP', reputation: 7150, joinedAt: daysAgo(62), status: 'active' },
    { id: 'u-4', name: 'Aman Verma', username: 'aman', email: 'aman@devhub.example', initials: 'AV', reputation: 2180, joinedAt: daysAgo(31), status: 'suspended' },
    { id: 'u-5', name: 'Neha Gupta', username: 'neha', email: 'neha@devhub.example', initials: 'NG', reputation: 920, joinedAt: daysAgo(5), status: 'active' },
    { id: 'u-6', name: 'Karan Mehta', username: 'karan', email: 'karan@devhub.example', initials: 'KM', reputation: 460, joinedAt: daysAgo(3), status: 'active' },
    { id: 'u-7', name: 'Sara Khan', username: 'sara', email: 'sara@devhub.example', initials: 'SK', reputation: 180, joinedAt: daysAgo(1), status: 'active' },
    { id: 'u-8', name: 'Dev Tester', username: 'devtester', email: 'tester@devhub.example', initials: 'DT', reputation: 20, joinedAt: daysAgo(0.2), status: 'suspended' },
  ]
  const questions = [
    { id: 'q-1', title: 'How do closures work in JavaScript?', author: 'Rahul Singh', tags: ['javascript', 'closures'], votes: 42, answers: 8, date: daysAgo(0.2), status: 'published', body: 'I understand lexical scope, but how does a returned function keep access to variables after its parent has finished? A small example would help.' },
    { id: 'q-2', title: 'When should I use React context?', author: 'Neha Gupta', tags: ['react', 'state'], votes: 28, answers: 5, date: daysAgo(1), status: 'published', body: 'My app shares a theme and current user across several routes. What makes context a good fit, and what state should stay local?' },
    { id: 'q-3', title: 'Understanding the Node.js event loop', author: 'Ankit Sharma', tags: ['nodejs', 'async'], votes: 36, answers: 7, date: daysAgo(2), status: 'published', body: 'I am comparing promises, timers, and synchronous callbacks. In what order will they run, and why?' },
    { id: 'q-4', title: 'How do closures work? Another example', author: 'Karan Mehta', tags: ['javascript'], votes: 2, answers: 1, date: daysAgo(3), status: 'published', body: 'This question repeats the same closure example from an existing discussion. Please help me understand the returned function.' },
    { id: 'q-5', title: 'Choosing indexes for a MongoDB collection', author: 'Priya Patel', tags: ['mongodb', 'database'], votes: 19, answers: 4, date: daysAgo(4), status: 'hidden', body: 'I query a collection by author and creation date. How should I order a compound index to support these queries?' },
    { id: 'q-6', title: 'Why is binary search O(log n)?', author: 'Sara Khan', tags: ['dsa', 'algorithms'], votes: 15, answers: 3, date: daysAgo(6), status: 'published', body: 'Each step halves the search space. How does that translate to logarithmic time complexity?' },
  ]
  const blogs = [
    { id: 'b-1', title: 'A practical guide to React hooks', author: 'Priya Patel', category: 'React', likes: 128, comments: 24, date: daysAgo(0.4), status: 'published', body: 'Hooks make it possible to share stateful logic across components. Start with local state, use effects to synchronize external systems, and extract custom hooks when a pattern repeats.' },
    { id: 'b-2', title: 'Building my first developer community', author: 'Ankit Sharma', category: 'Web Development', likes: 96, comments: 18, date: daysAgo(2), status: 'published', body: 'A small project can teach routing, reusable components, and careful state management. Here are the lessons from building a space where developers can learn together.' },
    { id: 'b-3', title: 'JavaScript promises never reject', author: 'Dev Tester', category: 'JavaScript', likes: 4, comments: 9, date: daysAgo(3), status: 'published', body: 'This mock post contains a misleading claim about promise rejection. It is included as a moderation example for the report queue.' },
    { id: 'b-4', title: 'Learning Python through small projects', author: 'Neha Gupta', category: 'Python', likes: 54, comments: 7, date: daysAgo(4), status: 'published', body: 'Build a command-line utility, a file organizer, and a small data report. Each project teaches a different part of the language.' },
    { id: 'b-5', title: 'Community posting guidelines', author: 'Aman Verma', category: 'Community', likes: 12, comments: 3, date: daysAgo(7), status: 'hidden', body: 'This sample submission is awaiting a moderation review before publication.' },
  ]
  const communityMessages = [
    { id: 'm-1', author: 'Dev Tester', text: 'Repeated promotional links in #general', status: 'published' },
    { id: 'm-2', author: 'Aman Verma', text: 'A reported personal remark in a mock discussion', status: 'published' },
    { id: 'm-3', author: 'Rahul Singh', text: 'Welcome to DevHub! What are you building?', status: 'published' },
  ]
  const reports = [
    { id: 'r-1', reporter: 'Priya Patel', targetType: 'message', targetId: 'm-1', targetTitle: 'Dev Tester’s message in #general', reason: 'Spam', details: 'The same promotional link was posted several times in the channel.', date: daysAgo(0.1), status: 'pending' },
    { id: 'r-2', reporter: 'Sara Khan', targetType: 'message', targetId: 'm-2', targetTitle: 'Aman’s community message', reason: 'Harassment', details: 'A personal remark was directed at another member instead of discussing the topic.', date: daysAgo(0.3), status: 'pending' },
    { id: 'r-3', reporter: 'Rahul Singh', targetType: 'blog', targetId: 'b-5', targetTitle: 'Community posting guidelines', reason: 'Inappropriate content', details: 'Please review this submission against the community posting guidelines.', date: daysAgo(1), status: 'reviewing' },
    { id: 'r-4', reporter: 'Ankit Sharma', targetType: 'question', targetId: 'q-4', targetTitle: 'How do closures work? Another example', reason: 'Duplicate question', details: 'An existing question already covers the same example and has an accepted explanation.', date: daysAgo(2), status: 'pending' },
    { id: 'r-5', reporter: 'Neha Gupta', targetType: 'blog', targetId: 'b-3', targetTitle: 'JavaScript promises never reject', reason: 'Misleading information', details: 'Promises can reject. The central claim in this example post needs correction.', date: daysAgo(3), status: 'pending' },
  ]
  return { users, questions, blogs, communityMessages, reports }
}
