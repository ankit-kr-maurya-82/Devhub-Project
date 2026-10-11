import { test, expect } from '@playwright/test'
import process from 'node:process'

const enabled = process.env.DEVHUB_E2E === '1'
const userEmail = process.env.E2E_USER_EMAIL
const userPassword = process.env.E2E_USER_PASSWORD
const adminEmail = process.env.E2E_ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD
const apiBase = process.env.E2E_API_URL ? new URL('/api/v1/', process.env.E2E_API_URL).toString().replace(/\/$/, '') : ''
const runId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
const createdBlogSlug = title => title.toLowerCase().replaceAll(' ', '-')

test.beforeEach(async ({ context }) => {
  if (!enabled) return
  const safeOrigins = new Set([
    new URL(process.env.E2E_BASE_URL).origin,
    new URL(process.env.E2E_API_URL).origin,
  ])
  await context.route('**/*', route => {
    const requestUrl = new URL(route.request().url())
    if (['http:', 'https:'].includes(requestUrl.protocol) && !safeOrigins.has(requestUrl.origin)) {
      return route.abort('blockedbyclient')
    }
    return route.continue()
  })
})

test.describe('DevHub live browser workflows', () => {
test.skip(!enabled, 'Set DEVHUB_E2E=1 to opt in to a disposable isolated test deployment.')

async function login(page, email = userEmail, password = userPassword) {
  test.skip(!email || !password, 'Dedicated E2E account credentials are not configured.')
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

async function removeOwnedQuestion(page, id) {
  if (!id) return
  const response = await page.request.delete(`${apiBase}/questions/${encodeURIComponent(id)}`)
  expect([200, 204, 404]).toContain(response.status())
}

async function removeOwnedBlog(page, slug) {
  if (!slug) return
  const response = await page.request.delete(`${apiBase}/blogs/${encodeURIComponent(slug)}`)
  expect([200, 204, 404]).toContain(response.status())
}

async function removeOwnedComment(page, id) {
  if (!id) return
  const response = await page.request.delete(`${apiBase}/comments/${encodeURIComponent(id)}`)
  expect([200, 204, 404]).toContain(response.status())
}

async function removeAdminProblem(page, slug) {
  if (!slug) return
  const response = await page.request.delete(`${apiBase}/coding/problems/${encodeURIComponent(slug)}`)
  expect([200, 204, 404]).toContain(response.status())
}

async function cleanupAll(actions) {
  const errors = []
  for (const action of actions) {
    try { await action() }
    catch (error) { errors.push(error) }
  }
  if (errors.length) throw new AggregateError(errors, 'One or more E2E cleanup actions failed.')
}

test('registration and login validation; login persists in an HttpOnly cookie and logout protects pages', async ({ page, context }) => {
  await page.goto('/register')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByText('Use 3–20 letters, numbers, or underscores.')).toBeVisible()
  await expect(page.getByText('Enter your email address.')).toBeVisible()

  await page.goto('/login')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page.getByText('Enter your email address.')).toBeVisible()
  await login(page)

  const cookies = await context.cookies([process.env.E2E_BASE_URL, process.env.E2E_API_URL])
  const sessionCookie = cookies.find(cookie => cookie.name === 'token')
  expect(sessionCookie, 'login should establish the token cookie').toBeTruthy()
  expect(sessionCookie.httpOnly).toBe(true)
  if (new URL(process.env.E2E_API_URL).protocol === 'https:') expect(sessionCookie.secure).toBe(true)

  await page.reload()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.getByRole('button', { name: 'Log out', exact: true }).click()
  await page.goto('/submissions')
  await expect(page).toHaveURL(/\/login$/)
})

test('unauthenticated requests cannot create or mutate protected resources', async ({ page }) => {
  const attempts = [
    page.request.post(`${apiBase}/questions`, { data: { title: `E2E unauthorized ${runId}`, description: 'Unauthorized test payload', tags: ['e2e'] } }),
    page.request.post(`${apiBase}/questions/507f1f77bcf86cd799439011/vote`, { data: { voteType: 'up' } }),
    page.request.post(`${apiBase}/blogs`, { data: { title: `E2E unauthorized ${runId}`, content: 'Unauthorized test payload', tags: ['e2e'], status: 'published' } }),
    page.request.post(`${apiBase}/coding/problems/${encodeURIComponent(process.env.E2E_PROBLEM_SLUG || 'e2e-test-problem')}/submissions`, { data: { language: 'javascript', sourceCode: '// unauthorized' } }),
    page.request.get(`${apiBase}/admin/users`),
    page.request.get(`${apiBase}/admin/reports`),
    page.request.get(`${apiBase}/coding/problems/manage`),
  ]
  const responses = await Promise.all(attempts)
  for (const response of responses) expect(response.status()).toBe(401)
})

test('question owner can create a question and manage their comment while another account votes', async ({ page }) => {
  test.skip(!userEmail || !userPassword || !adminEmail || !adminPassword, 'Dedicated ordinary and second-account credentials are required for ownership and voting checks.')
  await login(page)
  const title = `E2E question ${runId}`
  let questionId
  let commentId
  let voteRecorded = false

  try {
    await page.goto('/ask-question')
    const createResponse = page.waitForResponse(response => response.request().method() === 'POST' && /\/api\/v1\/questions$/.test(response.url()))
    await page.getByLabel('Title', { exact: true }).fill(title)
    await page.getByLabel('Description', { exact: true }).fill('This isolated E2E question verifies the question details workflow and comment ownership controls.')
    await page.getByLabel('Tags', { exact: true }).fill('e2e, testing')
    await page.getByRole('button', { name: 'Post question', exact: true }).click()
    const created = await (await createResponse).json()
    questionId = created.data?._id || created.data?.id
    expect(questionId, 'the test must capture the created question ID for scoped cleanup').toBeTruthy()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()

    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await login(page, adminEmail, adminPassword)
    await page.goto(`/questions/${questionId}`)
    const voteResponse = page.waitForResponse(response => response.request().method() === 'POST' && /\/vote$/.test(response.url()))
    await page.getByRole('button', { name: 'Upvote question' }).click()
    const voteResult = await voteResponse
    expect(voteResult.ok()).toBe(true)
    voteRecorded = true

    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await login(page)
    await page.goto(`/questions/${questionId}`)

    const comment = `E2E comment ${runId}`
    const commentResponse = page.waitForResponse(response => response.request().method() === 'POST' && new RegExp(`/questions/${questionId}/comments$`).test(new URL(response.url()).pathname))
    await page.getByRole('textbox', { name: 'Add a comment' }).fill(comment)
    await page.getByRole('button', { name: 'Comment', exact: true }).click()
    const createdComment = await (await commentResponse).json()
    commentId = createdComment.data?._id || createdComment.data?.id
    expect(commentId, 'the test must capture the created comment ID for scoped cleanup').toBeTruthy()
    const commentRow = page.locator('article').filter({ hasText: comment }).last()
    await expect(commentRow).toBeVisible()
    await commentRow.getByRole('button', { name: 'Edit', exact: true }).click()
    await commentRow.locator('textarea').fill(`${comment} updated`)
    await commentRow.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText(`${comment} updated`, { exact: true })).toBeVisible()
    const updatedRow = page.locator('article').filter({ hasText: `${comment} updated` }).last()
    await updatedRow.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByText(`${comment} updated`, { exact: true })).toHaveCount(0)
  } finally {
    await cleanupAll([
      async () => {
        if (commentId) {
          await login(page)
          await removeOwnedComment(page, commentId)
        }
      },
      async () => {
        if (voteRecorded && questionId) {
          await login(page, adminEmail, adminPassword)
          const response = await page.request.post(`${apiBase}/questions/${encodeURIComponent(questionId)}/vote`, { data: { voteType: 'upvote' } })
          expect(response.status()).toBe(200)
          expect((await response.json()).message).toBe('Vote removed')
        }
      },
      async () => {
        if (questionId) {
          await login(page)
          await removeOwnedQuestion(page, questionId)
        }
      },
    ])
  }
})

test('published blog browsing and owner draft, publish, edit, and delete flow', async ({ page }) => {
  test.skip(!userEmail || !userPassword, 'Dedicated E2E user credentials are not configured.')
  await login(page)
  const title = `E2E blog ${runId}`
  let slug = createdBlogSlug(title)
  let blogCreated = false

  try {
    await page.goto('/blogs')
    await expect(page.getByRole('heading', { name: 'Blogs', exact: true })).toBeVisible()
    await page.goto('/create-blog')
    await page.getByLabel('Title', { exact: true }).fill(title)
    await page.getByLabel('Tags, comma separated').fill('e2e')
    await page.getByLabel('Content', { exact: true }).fill(`Disposable E2E content ${runId} to verify publication visibility and owner operations.`)
    await page.getByLabel('Publication').selectOption('draft')
    const creationResponse = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/v1/blogs'))
    await page.getByRole('button', { name: 'Save blog' }).click()
    const createdResponse = await creationResponse
    expect(createdResponse.status()).toBe(201)
    const createdBlog = await createdResponse.json()
    slug = createdBlog.data?.slug || slug
    blogCreated = true
    await expect(page).toHaveURL(new RegExp(`/blogs/${slug}/edit$`))

    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await page.goto('/blogs')
    await expect(page.getByText(title, { exact: true })).toHaveCount(0)
    await login(page)
    await page.goto(`/blogs/${slug}/edit`)
    await page.getByLabel('Publication').selectOption('published')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page).toHaveURL(new RegExp(`/blogs/${slug}$`))
    await expect(page.getByRole('heading', { name: title })).toBeVisible()

    await page.goto(`/blogs/${slug}/edit`)
    await page.getByLabel('Title', { exact: true }).fill(`${title} revised`)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('heading', { name: `${title} revised` })).toBeVisible()
    await page.goto(`/blogs/${slug}/edit`)
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete blog' }).click()
    await expect(page).toHaveURL(/\/create-blog$/)
  } finally {
    if (blogCreated) {
      await cleanupAll([async () => {
        await login(page)
        await removeOwnedBlog(page, slug)
      }])
    }
  }
})

test('coding problem filters, submission storage, history, and truthful unavailable-judge feedback', async ({ page }) => {
  test.skip(!userEmail || !userPassword, 'Dedicated E2E user credentials are not configured.')
  test.skip(!process.env.E2E_PROBLEM_SLUG, 'Set E2E_PROBLEM_SLUG to a published test problem in the disposable database.')
  await login(page)
  await page.goto('/coding')
  await page.getByLabel('Difficulty').selectOption('easy')
  await expect(page).toHaveURL(/difficulty=easy/)
  await page.goto(`/coding/problem/${encodeURIComponent(process.env.E2E_PROBLEM_SLUG)}`)
  await expect(page.getByRole('heading', { name: 'Description' })).toBeVisible()
  const language = page.getByLabel('Language')
  await language.selectOption({ index: 0 })
  const editor = page.getByRole('textbox', { name: /solution$/i })
  await editor.fill('// stored by E2E; this is not executed')
  await page.getByRole('button', { name: 'Submit solution' }).click()
  await expect(page.getByText('Submission stored · Not executed')).toBeVisible()
  await expect(page.getByText(/secure judge service is not configured|No verdict was produced/i)).toBeVisible()
  await page.getByRole('link', { name: 'View submission history' }).click()
  await expect(page.getByRole('heading', { name: 'My submissions' })).toBeVisible()
})

test('regular users are denied admin screens and admin APIs; admin can review reports and manage test problems', async ({ page }) => {
  test.skip(!userEmail || !userPassword || !adminEmail || !adminPassword, 'Dedicated user and administrator E2E credentials are required.')
  await login(page)
  await page.goto('/admin/reports')
  await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible()
  const denied = await page.request.get(`${apiBase}/admin/reports`)
  expect([401, 403]).toContain(denied.status())

  await page.getByRole('button', { name: 'Log out', exact: true }).click()
  await login(page, adminEmail, adminPassword)
  const blogTitle = `E2E reported blog ${runId}`
  const blogSlug = createdBlogSlug(blogTitle)
  const problemTitle = `E2E admin problem ${runId}`
  const problemSlug = problemTitle.toLowerCase().replaceAll(' ', '-')
  let blogCreated = false
  let problemCreated = false

  try {
    await page.goto('/create-blog')
    await page.getByLabel('Title', { exact: true }).fill(blogTitle)
    await page.getByLabel('Tags, comma separated').fill('e2e')
    await page.getByLabel('Content', { exact: true }).fill(`Test-only report fixture ${runId}; safe to remove after this run.`)
    await page.getByLabel('Publication').selectOption('published')
    const blogCreation = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/v1/blogs'))
    await page.getByRole('button', { name: 'Save blog' }).click()
    const blogResponse = await blogCreation
    expect(blogResponse.status()).toBe(201)
    blogCreated = true
    await expect(page).toHaveURL(new RegExp(`/blogs/${blogSlug}$`))

    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await login(page)
    await page.goto(`/blogs/${blogSlug}`)
    await page.getByRole('button', { name: 'Report', exact: true }).click()
    await page.getByLabel('Details').fill(`Disposable E2E moderation report ${runId}`)
    await page.getByRole('button', { name: 'Submit report', exact: true }).click()
    await expect(page.getByText('Report sent to the moderation team.')).toBeVisible()

    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await login(page, adminEmail, adminPassword)
    await page.goto('/admin/reports')
    await expect(page.getByRole('heading', { name: 'Reports and moderation' })).toBeVisible()
    await page.getByLabel('Status').selectOption('')
    const reportCard = page.locator('article').filter({ hasText: blogTitle })
    await expect(reportCard).toBeVisible()
    await reportCard.getByRole('button', { name: 'Review', exact: true }).click()
    await expect(reportCard.getByRole('button', { name: 'Dismiss report', exact: true })).toBeVisible()
    page.once('dialog', dialog => dialog.accept())
    await reportCard.getByRole('button', { name: 'Dismiss report', exact: true }).click()
    await expect(reportCard.getByText('dismissed', { exact: true })).toBeVisible()

    await page.goto('/admin/users')
    await expect(page.getByRole('heading', { name: 'Manage users' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
    await page.getByLabel('Search').fill(userEmail)
    const userRow = page.getByRole('row').filter({ hasText: userEmail })
    await expect(userRow).toBeVisible()
    page.once('dialog', dialog => dialog.accept())
    await userRow.getByRole('button', { name: 'Suspend', exact: true }).click()
    await expect(userRow.getByRole('cell').nth(4)).toHaveText('Suspended')
    page.once('dialog', dialog => dialog.accept())
    await userRow.getByRole('button', { name: 'Reactivate', exact: true }).click()
    await expect(userRow.getByRole('cell').nth(4)).toHaveText('Active')
    await page.goto('/admin/coding')
    await expect(page.getByRole('heading', { name: 'Coding problems', exact: true })).toBeVisible()
    await page.getByLabel('Title', { exact: true }).fill(problemTitle)
    await page.getByLabel('Slug', { exact: true }).fill(problemSlug)
    await page.getByLabel('Description', { exact: true }).fill(`Disposable administrator E2E problem description ${runId}.`)
    const problemCreation = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/v1/coding/problems'))
    await page.getByRole('button', { name: 'Create problem', exact: true }).click()
    const problemResponse = await problemCreation
    expect(problemResponse.status()).toBe(201)
    problemCreated = true
    const problemRow = page.locator('li').filter({ hasText: problemTitle })
    await expect(problemRow).toBeVisible()
    page.once('dialog', dialog => dialog.accept())
    await problemRow.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(problemRow).toHaveCount(0)
  } finally {
    await login(page, adminEmail, adminPassword)
    await cleanupAll([
      async () => {
        const usersResponse = await page.request.get(`${apiBase}/admin/users?search=${encodeURIComponent(userEmail)}`)
        expect(usersResponse.status(), 'load the dedicated account before restoring its status').toBe(200)
        const userResult = await usersResponse.json()
        const testUser = userResult.data?.find(user => user.email === userEmail)
        expect(testUser, 'find only the configured dedicated E2E account').toBeTruthy()
        if (testUser && !testUser.isActive) {
          const restoreResponse = await page.request.patch(`${apiBase}/admin/users/${encodeURIComponent(testUser._id)}/status`, { data: { isActive: true } })
          expect(restoreResponse.ok(), 'restore the dedicated E2E account after admin status checks').toBe(true)
        }
      },
      async () => { if (problemCreated) await removeAdminProblem(page, problemSlug) },
      async () => { if (blogCreated) await removeOwnedBlog(page, blogSlug) },
    ])
  }
})
})
