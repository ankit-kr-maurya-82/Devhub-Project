import { blogs } from './home'

const articles = [
  `Good component design starts with a clear responsibility. Before extracting another abstraction, ask what the component needs to own and what its parent should decide.

## Compose small pieces
A reusable shell can accept children without knowing how those children work. A card can own spacing and borders while its caller supplies the heading, actions, and body. This keeps layout decisions separate from application behavior.

## Extract behavior into hooks
When several screens share the same state transitions, a custom hook gives that behavior a name. Keep the returned API small and document which inputs affect it. Avoid moving unrelated state into one hook just because it appears on the same page.

## Keep state close to its owner
Start with local state. Lift it only when another component needs to coordinate with it. Derived values can usually be calculated during render instead of copied into state.

The best abstraction is one your next teammate can understand quickly. Prefer a few explicit props and a focused responsibility, then refine the API as real use cases emerge.`,
  `A slow endpoint deserves a measurement before it deserves a rewrite. Record the query shape, the expected result size, and how the collection grows over time.

## Start with the query plan
Use an explain plan to compare documents examined with documents returned. A large gap can indicate that the database is doing unnecessary work. Check the filter and sort together rather than tuning them independently.

## Build indexes around access patterns
An index should support a query your application actually runs. For a feed filtered by author and sorted by date, evaluate a compound index that reflects those fields. Field order matters, so test against representative data.

## Account for the tradeoffs
Indexes consume storage and add work to writes. Adding an index for every field is rarely a good default. Review redundant indexes and measure latency before and after each change.

Keep a short record of the query, the dataset, and the result. Repeatable measurements make performance work easier to maintain as the application evolves.`,
  `Consistency is easier when practice has a clear finish line. A short session with reflection can teach more than hours spent collecting solutions.

## Choose one pattern
Pick a small topic such as frequency maps or sliding windows. Solve a straightforward example first, then vary one constraint. Explain why the approach works before trying to make it faster.

## Keep a learning journal
Write down the signal you missed, the invariant your solution maintains, and its time and space costs. These notes become useful reminders when you revisit the problem a week later.

## Review without the solution
Return to an earlier problem and reconstruct the approach from memory. If you get stuck, use a small hint and try again. The goal is to make reasoning repeatable.

End each session with one sentence about what changed in your understanding. Progress becomes easier to see when you track ideas rather than only completed problems.`,
]

const communityArticles = [
  {
    id: 'accessible-react-forms',
    title: 'Small details that make React forms feel effortless',
    author: 'Sofia Martinez',
    description: 'Build clearer forms with useful labels, thoughtful validation, and feedback that helps people keep moving.',
    tags: ['React', 'JavaScript'],
    category: 'FRONTEND',
    icon: 'code',
    accent: 'violet',
    publishedAt: '2026-09-15T10:30:00Z',
    likes: 46,
    comments: [{
      id: 'comment-forms',
      author: 'Alex Rivera',
      body: 'The reminder to keep what someone typed after a validation error is such a useful detail.',
      publishedAt: '2026-09-16T11:15:00Z',
    }],
    content: `A form is a conversation. It asks for something, explains why it matters, and helps a person recover when their answer needs another look. Those small exchanges deserve as much attention as the submit button.

## Start with a clear label
Every input needs a visible label that stays present after someone starts typing. A placeholder can show an example, but it disappears when the field contains a value. In React, connect the label with an input using matching \`htmlFor\` and \`id\` values.

### Make the next step obvious
Short, concrete helper text can prevent errors before they happen. Explain the expected format beside the field and use a button label that describes the result, such as **Publish article**. Avoid requiring people to guess which fields are optional.

## Validate at a useful moment
A message about an incomplete email address is rarely helpful after the first character. Let someone finish their thought, then offer feedback when they leave the field or submit the form.

- Keep the value they already entered.
- Place the error beside the field that needs attention.
- Explain how to fix the problem in plain language.
- Associate the message with its input using \`aria-describedby\`.

> A useful error message tells someone what they can do next.

## Make submission predictable
Represent the submission state explicitly: idle, submitting, success, or error. Disable repeated submissions while a request is pending and show a text status alongside any spinner. If the request fails, preserve the form and make retrying straightforward.

You can inspect the experience without a mouse. Use Tab to reach every input, check that focus is visible, and confirm that Enter submits when appropriate. Test a long name, an empty required field, and an error response as well as the happy path.

The goal is a form that feels calm. Clear labels and recoverable errors give people confidence that their work is safe and that the next action will do what it says.`,
  },
  {
    id: 'node-api-boundaries',
    title: 'Give your Node.js API room to grow',
    author: 'Noah Williams',
    description: 'A practical way to separate routing, application rules, and database access without overengineering your API.',
    tags: ['Node.js', 'MERN', 'MongoDB'],
    category: 'BACKEND',
    icon: 'grid',
    accent: 'emerald',
    publishedAt: '2026-09-12T08:00:00Z',
    likes: 102,
    comments: [{
      id: 'comment-api',
      author: 'Marcus Chen',
      body: 'Organizing by feature made it much easier for our team to find the code behind a request.',
      publishedAt: '2026-09-13T09:45:00Z',
    }],
    content: `A small API can fit comfortably in one file. As features grow, the challenge is not the number of lines. It is knowing where a behavior belongs and how to change it without disturbing everything around it.

## Follow one request
Take a familiar operation, such as creating an article. Write down the steps from the incoming request to the outgoing response:

1. Read and validate the request data.
2. Check the rules for creating an article.
3. Save the article through the database layer.
4. Return a response with the created resource.

These steps suggest useful boundaries. The HTTP layer translates request data, the application layer applies the rules, and a repository handles persistence. A boundary is valuable when it makes one of those responsibilities easier to understand.

## Keep the route easy to read
A route handler should tell a short story. This example assumes that earlier middleware has validated \`req.body\` and that errors flow to a shared error handler:

\`\`\`javascript
async function createArticle(req, res, next) {
  try {
    const article = await articleService.create(req.body)
    res.status(201).json({ article })
  } catch (error) {
    next(error)
  }
}
\`\`\`

The service does not need to know about \`res\`. That separation lets you exercise an application rule without constructing an HTTP response object. Likewise, the route should not need to know which MongoDB collection stores the article.

### Organize around the feature
Keep an article's route, service, and persistence code close together when that makes navigation easier. You do not need an empty abstraction for every possible future feature. Extract a shared module only after a repeated responsibility becomes clear.

## Check the boundary with a change
Imagine adding a rule that only published articles appear in the public feed. You should be able to find the rule, explain it, and test it in one focused place. If every layer repeats the same decision, the boundary may need another look.

A structure earns its place by making everyday changes easier. Choose a small set of responsibilities your team can describe, then let real requirements guide the next extraction.`,
  },
  {
    id: 'frequency-maps',
    title: 'A frequency map is a small tool with a lot of range',
    author: 'Priya Shah',
    description: 'Learn to spot counting problems and turn repeated scans into a single, understandable pass through your data.',
    tags: ['DSA', 'JavaScript', 'Python'],
    category: 'CAREER & GROWTH',
    icon: 'book',
    accent: 'amber',
    publishedAt: '2026-09-10T14:00:00Z',
    likes: 38,
    comments: [{
      id: 'comment-frequency',
      author: 'Aisha Patel',
      body: 'Tracing one example by hand really helps the pattern stick before moving to a harder problem.',
      publishedAt: '2026-09-11T07:30:00Z',
    }],
    content: `Some algorithm problems ask the same question in different clothes: **how many times have I seen this value?** A frequency map makes that question explicit. It associates each value with a count, so later decisions can use the count directly.

## Recognize the signal
Look for a task involving duplicates, inventories, character counts, or matching groups. Before choosing a data structure, describe exactly what you need to remember after processing each item.

For a list of tags, the useful state is the number of times each tag has appeared so far:

\`\`\`javascript
function countTags(tags) {
  const counts = new Map()

  for (const tag of tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }

  return counts
}
\`\`\`

With common constant-time map operations, this takes expected **O(n)** time for n input tags and **O(k)** additional space for k distinct tags. The extra space is the tradeoff that lets you avoid repeatedly scanning the full input.

## Trace a tiny example
Use the input \`['React', 'Node.js', 'React']\`. After the first item, React has a count of one. After the second, the map contains two distinct keys. The final item increases React's count to two.

1. State what each key represents.
2. Explain why each update preserves the correct count.
3. Check what happens when the input is empty.
4. Decide whether capitalization should affect equality.

That last decision belongs to the problem. If tags are case-insensitive, normalize them consistently before counting. Avoid changing the meaning of the input simply because normalization is convenient.

### Practice one variation
Try finding the first value that appears exactly once. Build the counts, then walk through the original input in order and return the first item whose count is one. Two passes are still linear in the size of the input.

> Write down the information you need to remember before reaching for a clever solution.

A pattern becomes useful when you can explain why it fits. Practice a few variations, compare their requirements, and keep a note about the signal that led you to a frequency map.`,
  },
]

const sampleComments = [
  {
    author: 'Alex Rivera',
    body: 'The distinction between layout and behavior really helped me rethink my components.',
  },
  {
    author: 'Sarah Kim',
    body: 'Measuring documents examined gave me a useful starting point. Thanks for the walkthrough!',
  },
  {
    author: 'Dev Sharma',
    body: 'Keeping a learning journal has made my practice sessions much more focused.',
  },
]

export const initialBlogs = [
  ...blogs.map((blog, index) => ({
    ...blog,
    content: articles[index],
    featured: index < 2,
    publishedAt: `2026-09-${24 - index * 3}T09:00:00Z`,
    likes: [124, 89, 67][index],
    liked: false,
    comments: [{
      id: `comment-${index}`,
      ...sampleComments[index],
      publishedAt: '2026-09-25T08:00:00Z',
    }],
  })),
  ...communityArticles.map(blog => ({ ...blog, featured: false, liked: false })),
].map(blog => ({ ...blog, readingTime: readingTime(blog.content) }))

export function markdownToText(content = '') {
  return content
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*```[^\n]*$/gm, '')
    .replace(/^\s*#{2,3}\s+/gm, '')
    .replace(/^\s*(?:[-*]|\d+[.)])\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function readingTime(content) {
  const words = markdownToText(content).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export function formatBlogDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
