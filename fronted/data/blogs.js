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

export const initialBlogs = blogs.map((blog, index) => ({
  ...blog, content: articles[index], featured: index < 2,
  publishedAt: `2026-09-${24 - index * 3}T09:00:00Z`,
  likes: [124, 89, 67][index], liked: false,
  comments: [{ id: `comment-${index}`, author: ['Alex Rivera', 'Sarah Kim', 'Dev Sharma'][index], body: ['The distinction between layout and behavior really helped me rethink my components.', 'Measuring documents examined gave me a useful starting point. Thanks for the walkthrough!', 'Keeping a learning journal has made my practice sessions much more focused.'][index], publishedAt: '2026-09-25T08:00:00Z' }],
}))

export const readingTime = content => `${Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200))} min read`
export const formatBlogDate = date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
