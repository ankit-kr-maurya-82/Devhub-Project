// Account and contribution data is loaded from the backend for the signed-in user.
export const developer = null
export const developerStats = []
export const achievements = []
export const recentActivity = []
export const profileQuestions = []
export const profileAnswers = []
export const profileBlogs = []
export const contributions = []
export const topTags = []
export function formatDeveloperDate(value) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
