import { defineConfig } from '@playwright/test'
import process from 'node:process'

const enabled = process.env.DEVHUB_E2E === '1'
const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173'
const allowedOrigins = [baseURL, ...(process.env.E2E_API_URL ? [process.env.E2E_API_URL] : [])]

function isTestHost(value) {
  const { hostname, protocol } = new URL(value)
  return ['http:', 'https:'].includes(protocol)
    && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
      || hostname.endsWith('.localhost') || hostname.endsWith('.test'))
}

if (enabled) {
  if (process.env.DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB !== 'YES') {
    throw new Error('Set DEVHUB_E2E_CONFIRM_ISOLATED_DISPOSABLE_DB=YES only for a disposable, isolated test database.')
  }
  if (!process.env.E2E_API_URL) throw new Error('E2E_API_URL must identify the test API origin.')
  for (const origin of allowedOrigins) {
    if (!isTestHost(origin)) throw new Error('E2E targets must use localhost, *.localhost, or *.test hosts; production hosts are refused.')
  }
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
