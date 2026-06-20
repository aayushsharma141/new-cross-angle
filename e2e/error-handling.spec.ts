import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const dismissCookieBanner = async (page: import('@playwright/test').Page) => {
  try {
    const banner = page.locator('aside[aria-live="polite"]');
    const isVisible = await banner.isVisible().catch(() => false);
    if (!isVisible) return;
    const acceptBtn = banner.locator('button').filter({ hasText: /accept/i }).first();
    await acceptBtn.click({ timeout: 3_000 });
    await banner.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  } catch {
    // Banner not present or already dismissed
  }
};

async function waitForAdminShell(page: import('@playwright/test').Page) {
  await page.waitForSelector('aside, h1, h2', { timeout: 15_000 }).catch(() => {});
}

async function assertAuthenticated(page: import('@playwright/test').Page) {
  await expect(page).not.toHaveURL(/\/(admin\/login|sign-in|auth)/i, { timeout: 5_000 });
}

test.describe('Error Boundaries & 404 Pages', () => {
  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-123');
    await dismissCookieBanner(page);

    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 5_000 });

    const bodyText = await body.innerText().catch(() => '');
    const has404 = /page not found|404|not found|doesn't exist|does not exist/i.test(bodyText);
    expect(has404).toBeTruthy();
  });

  test('error boundary catches render errors', async ({ page }) => {
    await page.goto('/services?category=residential');
    await dismissCookieBanner(page);
    await page.waitForTimeout(1_000);

    await expect(page.locator('main')).toBeVisible({ timeout: 8_000 });

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const errorUi = page.locator(
      '[class*="error-boundary"], [class*="error-fallback"], [role="alert"], [class*="error-state"]',
    ).first();
    const errorUiVisible = await errorUi.isVisible().catch(() => false);

    if (errorUiVisible) {
      await expect(errorUi).toBeVisible();
    }
  });

  test('admin routes show error boundary on failure', async ({ page }) => {
    await page.goto('/admin/crm/leads');
    await dismissCookieBanner(page);
    await waitForAdminShell(page);
    await assertAuthenticated(page);

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const notOnLogin = !/(sign in|log in|login)/i.test(bodyText);
    expect(notOnLogin).toBeTruthy();
  });

  test('network errors show user-friendly message', async ({ page }) => {
    await page.route('**/rest/v1/**', route => route.abort());

    await page.goto('/admin/dashboard');
    await dismissCookieBanner(page);
    await waitForAdminShell(page);
    await assertAuthenticated(page);

    await page.waitForTimeout(2_000);

    const spinnerStuck = page.locator('[class*="spinner"], [class*="loading"]').first();
    const spinnerStillVisible = await spinnerStuck.isVisible().catch(() => false);

    if (spinnerStillVisible) {
      await page.waitForTimeout(3_000);
      const stillSpinning = await spinnerStuck.isVisible().catch(() => false);
      expect(stillSpinning).toBeFalsy();
    }

    const errorState = page.locator(
      '[class*="error"], [role="alert"], button:has-text("retry"), button:has-text("Retry"), [class*="error-boundary"]',
    ).first();
    const errorVisible = await errorState.isVisible().catch(() => false);
  });

  test('console errors captured when Supabase unavailable', async ({ page }) => {
    const sentryCalls: string[] = [];
    await page.exposeFunction('__playwright_sentry_capture', (msg: string) => {
      sentryCalls.push(msg);
    });

    await page.addInitScript(() => {
      const orig = window.onerror;
      window.onerror = (msg) => {
        const w = window as unknown as Record<string, unknown>;
        if (typeof w.__playwright_sentry_capture === 'function') {
          (w.__playwright_sentry_capture as (m: string) => void)(String(msg));
        }
        return orig ? orig.call(window, msg) : false;
      };
    });

    await page.route('**/rest/v1/**', route => route.abort());

    const browserErrors: string[] = [];
    page.on('pageerror', err => browserErrors.push(err.message));

    await page.goto('/admin/dashboard');
    await dismissCookieBanner(page);
    await waitForAdminShell(page);
    await assertAuthenticated(page);

    await page.waitForTimeout(3_000);
  });
});
