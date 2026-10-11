import { defineConfig } from '@playwright/test'
import process from 'node:process'

const enabled = process.env.DEVHUB_E2E === '1'
const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:5173'
const apiURL = process.env.E2E_API_URL

function parseTestOrigin(value, name) {
  let url
  try { url = new URL(value) }
  catch { throw new Error(`${name} must be an HTTP(S) origin on localhost or a reserved .test host.`) }
  const testHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]'
    || url.hostname.endsWith('.localhost') || url.hostname.endsWith('.test')
  if (!['http:', 'https:'].includes(url.protocol) || !testHost || url.username || url.password
    || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTP(S) origin on localhost or a reserved .test host, without credentials or a path.`)
  }
  return url.origin
}

if (enabled) {
  if (process.env.DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB !== 'YES') {
    throw new Error('Set DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB=YES only for a disposable, isolated test database.')
  }
  const required = ['E2E_BASE_URL', 'E2E_API_URL', 'E2E_USER_EMAIL', 'E2E_USER_PASSWORD', 'E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD', 'E2E_PROBLEM_SLUG']
  const missing = required.filter(name => !process.env[name])
  if (missing.length) throw new Error(`Set all dedicated E2E account and problem values before enabling the suite: ${missing.join(', ')}.`)
  if (process.env.E2E_USER_EMAIL.toLowerCase() === process.env.E2E_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('E2E_USER_EMAIL and E2E_ADMIN_EMAIL must be different dedicated accounts.')
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(process.env.E2E_PROBLEM_SLUG)) throw new Error('E2E_PROBLEM_SLUG must be a published test problem slug.')
  parseTestOrigin(baseURL, 'E2E_BASE_URL')
  parseTestOrigin(apiURL, 'E2E_API_URL')
}

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
      args: ['--no-sandbox'],
    },
    trace: 'retain-on-failure',
  },
})
