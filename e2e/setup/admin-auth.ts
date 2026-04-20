/**
 * Playwright global setup — creates an authenticated admin session.
 *
 * Required env vars (set in .env.test or CI secrets):
 *   PLAYWRIGHT_ADMIN_EMAIL    – Supabase admin account email
 *   PLAYWRIGHT_ADMIN_PASSWORD – Supabase admin account password
 *
 * The resulting storage state (cookies + localStorage) is written to
 * e2e/setup/.auth/admin.json and reused by every test via storageState.
 */

import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const STORAGE_STATE = path.join(__dirname, '.auth', 'admin.json');

async function globalSetup() {
  const email = process.env.PLAYWRIGHT_ADMIN_EMAIL;
  const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8080';

  if (!email || !password) {
    console.warn(
      '[E2E setup] PLAYWRIGHT_ADMIN_EMAIL / PLAYWRIGHT_ADMIN_PASSWORD not set. ' +
      'Tests requiring auth will fail with a redirect to the login page.'
    );
    // Write an empty state so storageState doesn't error
    const dir = path.dirname(STORAGE_STATE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORAGE_STATE, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the admin login page and sign in
    await page.goto(`${baseURL}/admin`);

    // Wait for the login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitBtn.click();

    // Wait until redirected away from the login page
    await page.waitForURL((url) => !url.pathname.includes('/admin/login') && url.pathname.startsWith('/admin'), {
      timeout: 20_000,
    });

    // Persist the auth state
    const dir = path.dirname(STORAGE_STATE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await page.context().storageState({ path: STORAGE_STATE });

    console.log('[E2E setup] Admin session saved to', STORAGE_STATE);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
