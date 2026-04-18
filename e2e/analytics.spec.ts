import { test, expect } from '@playwright/test';

test.describe('Analytics Consent Gating', () => {
  test('does not initialize PostHog or GA before consent', async ({ page }) => {
    await page.goto('/');
    
    // Check that posthog is not defined globally
    const isPostHogDefined = await page.evaluate(() => typeof (window as any).posthog === 'undefined');
    expect(isPostHogDefined).toBe(true);

    // Check that GA is not defined
    const isGADefined = await page.evaluate(() => typeof (window as any).gtag === 'undefined');
    expect(isGADefined).toBe(true);
  });

  test('initializes analytics after "Accept All" click', async ({ page }) => {
    await page.goto('/');

    const acceptAll = page.locator('button').filter({ hasText: /Accept All/i }).first();
    await expect(acceptAll).toBeVisible();
    await acceptAll.click();

    // Wait for the idle timer (1800ms in CookieConsentProvider)
    await page.waitForTimeout(2500);

    // Check that PostHog is initialized
    // Note: In our refactored lib/posthog.ts, we export the posthog instance.
    // We check if the init function was called by looking for the persistence or a specific flag.
    const posthogConfig = await page.evaluate(() => {
      const ph = (window as any).posthog;
      if (!ph) return null;
      return {
        persistence: ph.persistence?.name,
        host: ph.config?.api_host
      };
    });

    // PostHog should be defined now
    expect(posthogConfig).not.toBeNull();
    
    // In local dev, host should be https://us.i.posthog.com
    // In prod (IS_PROD=true), it would be /ingest
    expect(posthogConfig?.host).toContain('posthog.com');
  });

  test('only initializes Strict cookies (no analytics) after "Necessary Only" click', async ({ page }) => {
    await page.goto('/');

    const necessaryOnly = page.locator('button').filter({ hasText: /Necessary Only/i }).first();
    await expect(necessaryOnly).toBeVisible();
    await necessaryOnly.click();

    await page.waitForTimeout(2500);

    const isPostHogDefined = await page.evaluate(() => typeof (window as any).posthog === 'undefined');
    expect(isPostHogDefined).toBe(true);
  });
});
