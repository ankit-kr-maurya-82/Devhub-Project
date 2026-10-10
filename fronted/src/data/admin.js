// Administrative records are not bundled; this feature needs backend admin APIs.
export function createAdminData() {
  return { users: [], questions: [], blogs: [], communityMessages: [], reports: [] }
}
