import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE } from './e2e/setup/admin-auth';
import path from 'path';

/**
 * Playwright configuration.
 *
 * Two project groups:
 *  1. "setup"  – runs globalSetup to produce an authenticated session file.
 *  2. Browsers – depend on "setup" and reuse the saved storage state so
 *                every test starts already logged in as admin.
 *
 * Required env vars for authenticated tests:
 *   PLAYWRIGHT_ADMIN_EMAIL
 *   PLAYWRIGHT_ADMIN_PASSWORD
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,          // serial within a file (suite depends on auth state)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'e2e/reports' }], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    // Reuse the saved admin session for every test
    storageState: STORAGE_STATE,
  },

  projects: [
    // ── Auth setup (runs once, writes storage state) ──────────────────────
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,           // matches e2e/setup/*.setup.ts if needed
      use: { storageState: undefined },      // setup project must NOT reuse state
    },

    // ── Browser projects (depend on setup) ────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },
  ],

  globalSetup: path.resolve('./e2e/setup/admin-auth.ts'),

  webServer: {
    command: 'npm run dev:web',
    url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
