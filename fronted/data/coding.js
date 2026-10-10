// Problem and submission records must come from a persistent API.
export const languages = []
export const codingProblems = []
export const codingStats = null
export const submissions = []

export function getStarterCode() { return '' }
export function getTestCases() { return [] }
export function formatSubmissionDate(value) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
