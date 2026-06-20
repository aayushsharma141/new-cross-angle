import { test, expect, Page } from '@playwright/test';

const dismissCookieBanner = async (page: Page) => {
  const banner = page.locator('div.fixed.inset-0.z-\\[100\\]');
  const acceptAll = page.locator('button').filter({ hasText: /Accept All/i }).first();
  if (await acceptAll.isVisible()) {
    await acceptAll.click();
    await expect(banner).not.toBeVisible();
  }
};

test.describe('Phase 2: Structural Verification', () => {
  test('Layout switching remains stable', async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    await page.goto('/services');
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(/\/services/);

    await page.goBack();
    await page.waitForTimeout(500);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('Unsplash URLs are substituted', async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);

    const srcs: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).map(img => img.src)
    );

    console.log(`Checked ${srcs.length} images for unsplash.com`);

    for (const src of srcs) {
      expect(src).not.toContain('unsplash.com');
    }
  });
});

test.describe('Phase 3: SEO Engine & Rendering Validation', () => {
  test('Lazy Loading boundaries block network requests', async ({ page }) => {
    const loadedUrls: string[] = [];

    page.on('response', response => {
      const url = response.url();
      if (response.request().resourceType() === 'image') {
        loadedUrls.push(url);
      }
    });

    await page.goto('/gallery');
    await dismissCookieBanner(page);
    await page.waitForTimeout(1000);

    const totalImages = await page.locator('img').count();
    expect(totalImages).toBeGreaterThan(0);

    const lazyImages = await page.locator('img[loading="lazy"]').count();
    expect(lazyImages).toBeGreaterThan(0);

    const loadedCount = loadedUrls.length;
    expect(loadedCount).toBeLessThan(totalImages);
  });
});
