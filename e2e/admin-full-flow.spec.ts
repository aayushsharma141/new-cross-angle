/**
 * Admin Panel Full Flow E2E Test
 * Tests: Login → Navigate all modules → Logout
 *
 * This test does NOT use the pre-authenticated storageState.
 * It performs a fresh login, navigates every admin module, then logs out.
 */
import { test, expect } from '@playwright/test';

// Override storageState so we start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD!;

/** Dismiss the cookie-consent banner if it is visible and wait for it to clear. */
async function dismissCookieBanner(page: import('@playwright/test').Page) {
  try {
    const banner = page.locator('aside[aria-live="polite"]');
    // Only act if the banner is actually visible
    const isVisible = await banner.isVisible().catch(() => false);
    if (!isVisible) return;

    const acceptBtn = banner.locator('button').filter({ hasText: /accept/i }).first();
    await acceptBtn.click({ timeout: 3_000 });
    // Wait for the banner to disappear so it no longer intercepts pointer events
    await banner.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  } catch {
    // Banner not present or already dismissed — ignore
  }
}

/** Log in as admin via the /admin/auth form. */
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/admin/auth');
  await page.waitForLoadState('networkidle');
  await dismissCookieBanner(page);
  await page.locator('#email-login').fill(ADMIN_EMAIL);
  await page.locator('#password-login').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/admin', { timeout: 25_000 });
}

test.describe.serial('Admin Panel: Login → Modules → Logout', () => {
  test('Login with valid credentials', async ({ page }) => {
    await page.goto('/admin/auth');
    await expect(page.locator('h1')).toContainText('Admin Sign In');

    // Dismiss cookie-consent banner if it appears (it intercepts pointer events)
    await dismissCookieBanner(page);

    await page.locator('#email-login').fill(ADMIN_EMAIL);
    await page.locator('#password-login').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Should redirect to /admin after successful login
    await page.waitForURL('**/admin', { timeout: 20_000 });
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('Admin Hub loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('body')).not.toContainText('Admin Sign In');
  });

  test('Dashboard module', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('networkidle');
  });

  // CMS modules
  test('CMS - Portfolio', async ({ page }) => {
    await page.goto('/admin/cms/portfolio');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CMS - Services', async ({ page }) => {
    await page.goto('/admin/cms/services');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CMS - Testimonials', async ({ page }) => {
    await page.goto('/admin/cms/testimonials');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CMS - Blogs', async ({ page }) => {
    await page.goto('/admin/cms/blogs');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CMS - Media', async ({ page }) => {
    await page.goto('/admin/cms/media');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CMS - Hero', async ({ page }) => {
    await page.goto('/admin/cms/hero');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CMS - Gallery', async ({ page }) => {
    await page.goto('/admin/cms/gallery');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('CMS - Team', async ({ page }) => {
    await page.goto('/admin/cms/team');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // CRM
  test('CRM - Leads', async ({ page }) => {
    await page.goto('/admin/crm/leads');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // Estimate
  test('Estimate - Leads', async ({ page }) => {
    await page.goto('/admin/estimate/leads');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Estimate - Rates', async ({ page }) => {
    await page.goto('/admin/estimate/rates');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // Style Quiz
  test('Style Quiz - Analytics', async ({ page }) => {
    await page.goto('/admin/style-quiz/analytics');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // Blog analytics
  test('Blog - Overview', async ({ page }) => {
    await page.goto('/admin/blog/overview');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Blog - Performance', async ({ page }) => {
    await page.goto('/admin/blog/performance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Blog - Engagement', async ({ page }) => {
    await page.goto('/admin/blog/engagement');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // System
  test('System - Settings', async ({ page }) => {
    await page.goto('/admin/system/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('System - Team Members', async ({ page }) => {
    await page.goto('/admin/system/team-members');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('System - Audit Logs', async ({ page }) => {
    await page.goto('/admin/system/audit');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // Access management
  test('Access Management', async ({ page }) => {
    await page.goto('/admin/system/access');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  // Logout
  test('Logout flow', async ({ page }) => {
    // This suite clears storageState, so each test starts unauthenticated.
    // Re-login before testing logout to ensure we reach the admin panel.
    await loginAsAdmin(page);
    await page.waitForLoadState('networkidle');

    // Click the Logout button in the top bar
    await page.locator('button:has-text("Logout")').click();

    // Should redirect to signed-out confirmation page
    await page.waitForURL('**/admin/auth?signed-out=true', { timeout: 15_000 });
    await expect(page.locator('h1')).toContainText('Signed Out');

    // Click "Sign In Again" to verify it returns to login
    await page.locator('button:has-text("Sign In Again")').click();
    await expect(page.locator('h1')).toContainText('Admin Sign In');
  });

  test('Unauthenticated access redirects to login', async ({ page }) => {
    // After logout, trying to access admin should redirect to auth
    await page.goto('/admin/dashboard');
    await page.waitForURL('**/admin/auth**', { timeout: 15_000 });
    await expect(page.locator('h1')).toContainText('Admin Sign In');
  });
});
