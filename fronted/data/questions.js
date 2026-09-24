import { questions as homeQuestions } from './home'

const now = Date.now()
const details = [
  { body: 'I am building a small React app with StrictMode enabled. On the initial page load, my effect logs twice, even though its dependency array is empty.\n\nI expected one request when the component mounts. I have checked that the component is not being rendered by two different parents. How should I structure the effect so it cleans up correctly?', code: "useEffect(() => {\n  console.log('Loading questions');\n  fetch('/questions').then(res => res.json()).then(setQuestions);\n}, []);", reputation: 2450, responses: [
    { id: 'react-answer-1', body: 'StrictMode runs an extra setup and cleanup cycle for effects in development. Make the effect safe to clean up: cancel requests or ignore stale responses, and always unsubscribe from listeners. The extra cycle helps expose missing cleanup.', code: "useEffect(() => {\n  const controller = new AbortController();\n  loadQuestions({ signal: controller.signal });\n  return () => controller.abort();\n}, []);", username: 'emma.dev', reputation: 8200, votes: 42, accepted: true },
    { id: 'react-answer-2', body: 'Also check whether the request belongs in an effect. For a user-triggered action, use the event handler. For data loading, a cache can help deduplicate requests and manage stale data.', username: 'marcus.codes', reputation: 3600, votes: 18 },
  ] },
  { body: 'My Express application has grown from a few endpoints to several feature areas. Routes, validation, and database queries are currently in the same files.\n\nI want a structure that is easy to navigate and test without adding unnecessary abstractions. Should I group by layer or by feature?', code: 'src/\n  routes.js\n  models/\n  app.js', reputation: 1820, responses: [
    { id: 'node-answer-1', body: 'Grouping by feature is a useful starting point. Each feature can own its routes, validation, and service functions. Keep HTTP concerns in handlers and business rules in services. Extract shared code only when multiple features need it.', code: 'src/\n  questions/\n    routes.js\n    service.js\n    validation.js\n  users/\n    routes.js\n    service.js\n  app.js', username: 'aisha.dev', reputation: 5100, votes: 31, accepted: true },
  ] },
  { body: 'I am practicing array and string problems and often struggle to decide between a sliding window and two pointers.\n\nFor example, longest substring without repeating characters seems to use both. Is there a useful distinction, and how can I recognize when a window should expand or shrink?', code: '', reputation: 970, responses: [
    { id: 'dsa-answer-1', body: 'Sliding window is a two-pointer technique that maintains a contiguous range and a property of that range. Expand the right boundary to add an item and move the left boundary when the property is violated. Two pointers is broader: pointers may also move inward from opposite ends, as in pair-sum problems on sorted arrays.', username: 'dan.algorithm', reputation: 4200, votes: 24 },
  ] },
]

export const initialQuestions = homeQuestions.map((question, index) => ({
  ...question, ...details[index], createdAt: now - (index + 1) * 7200000,
  updatedAt: now - (3 - index) * 900000, userVote: 0,
  responses: details[index].responses.map(answer => ({ ...answer, userVote: 0, time: '1 hour ago' })),
  answers: details[index].responses.length,
}))
initialQuestions.push({ id: 'python-generators', title: 'How can I process a large CSV with Python generators?', description: 'Looking for a way to process rows without loading the entire file into memory.', body: 'I have a CSV that is larger than the available memory on my laptop. I need to validate each row and write the valid rows to a new file.\n\nHow can I use a generator to keep memory usage low while still reporting invalid rows?', code: '', tags: ['Python'], votes: 12, userVote: 0, answers: 0, responses: [], views: '84', username: 'leo.py', reputation: 320, time: '30 minutes ago', createdAt: now - 1800000, updatedAt: now - 1800000 })
