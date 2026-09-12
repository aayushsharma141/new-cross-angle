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

import { chromium, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORAGE_STATE = path.join(__dirname, '.auth', 'admin.json');

async function dismissCookieBanner(page: Page) {
  const banner = page.locator('aside[aria-live="polite"]');
  if (!(await banner.isVisible().catch(() => false))) return;

  const accept = banner.locator('button').filter({ hasText: /accept/i }).first();
  await accept.click({ timeout: 3_000 }).catch(() => undefined);
  await banner.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
}

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
  // Vercel Deployment Protection (preview SSO) sits in front of the app on
  // preview URLs. With the project's "Protection Bypass for Automation" secret
  // in VERCEL_AUTOMATION_BYPASS_SECRET, send it on every request so the setup
  // reaches the real /admin/auth form instead of Vercel's SSO page.
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  
  const context = await browser.newContext(
    bypass ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': bypass } } : {}
  );
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('request', req => {
    if (req.url().includes('login')) {
      console.log('LOGIN REQ HEADERS:', req.headers());
    }
  });
  page.on('request', req => console.log('REQ:', req.method(), req.url()));
  page.on('response', async res => {
    console.log('RES:', res.status(), res.url());
    if (res.url().includes('login')) {
      try {
        const text = await res.text();
        console.log('LOGIN RES BODY:', text);
      } catch (e) {}
    }
  });

  try {
    // Navigate to the admin login page and sign in
    const adminUrl = new URL(`${baseURL}/admin`);
    await page.goto(adminUrl.toString());
    await dismissCookieBanner(page);

    // Wait for the login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await page.screenshot({ path: 'test-screenshot.png' });
    await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitBtn.click({ force: true });

    // Wait until the authenticated admin shell is reached. `/admin/auth` is
    // also an admin-prefixed path, so do not treat it as a successful login.
    await page.waitForURL(
      (url) =>
        (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) &&
        !url.pathname.includes('/admin/auth') &&
        !url.pathname.includes('/admin/login'),
      { timeout: 20_000 },
    ).catch(async (error) => {
      const visibleText = (await page.locator('body').innerText().catch(() => '')).slice(0, 800);
      throw new Error(
        `Admin login did not reach the authenticated shell. Current URL: ${page.url()}. ` +
        `Visible page text: ${visibleText || '(empty)'}. Root cause: ${String(error)}`,
      );
    });
    if (page.url().includes('/admin/auth') || page.url().includes('/admin/login')) {
      throw new Error(`Admin login did not complete; still on ${page.url()}`);
    }

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
